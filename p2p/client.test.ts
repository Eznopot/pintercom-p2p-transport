import test from "node:test";
import assert from "node:assert/strict";
import { confirmP2PListenAddresses, p2pMdnsAnswers, P2PIntercomClient } from "./client.ts";
import type { SessionRegistration } from "../types.ts";

function registration(name: string): SessionRegistration {
  return {
    name,
    cwd: process.cwd(),
    model: "test",
    pid: process.pid,
    startedAt: Date.now(),
    lastActivity: Date.now(),
  };
}

test("p2p confirms every bound address for link-local mDNS advertisement", () => {
  const addresses = [{ id: "loopback" }, { id: "public-range-lan" }];
  const confirmed: Array<{ address: unknown; type: string }> = [];

  confirmP2PListenAddresses({
    transportManager: { getAddrs: () => addresses },
    addressManager: {
      confirmObservedAddr: (address, { type }) => confirmed.push({ address, type }),
    },
  } as never);

  assert.deepEqual(confirmed, addresses.map((address) => ({ address, type: "transport" })));
});

test("p2p mDNS advertises bound public-range LAN addresses", () => {
  const answers = p2pMdnsAnswers("_pi-intercom._udp.local", "peer", [
    { toString: () => "/ip4/70.0.0.138/tcp/52180/p2p/peer" },
  ]);

  assert.equal(answers[1]?.data, "dnsaddr=/ip4/70.0.0.138/tcp/52180/p2p/peer");
});

async function wirePair(sender: P2PIntercomClient, receiver: P2PIntercomClient): Promise<void> {
  const senderNode = Reflect.get(sender, "node");
  const receiverNode = Reflect.get(receiver, "node");
  await senderNode.dial(receiverNode.getMultiaddrs());
  await Reflect.apply(Reflect.get(sender, "announceToPeer"), sender, [receiverNode.peerId]);
  await Reflect.apply(Reflect.get(receiver, "announceToPeer"), receiver, [senderNode.peerId]);
}

test("p2p clients exchange authenticated messages over an encrypted libp2p stream", async () => {
  const previousKey = process.env.PI_INTERCOM_P2P_KEY;
  process.env.PI_INTERCOM_P2P_KEY = "test-shared-key-1234";
  const sender = new P2PIntercomClient();
  const receiver = new P2PIntercomClient();

  try {
    await sender.connect(registration("sender"), "sender-id");
    await receiver.connect({
      ...registration("receiver"),
      hostname: "remote-device",
      os: "Linux arm64",
      sshRemote: "root@device.local",
    }, "receiver-id");

    // Make discovery deterministic in the test; production uses the same
    // announce handshake after mDNS emits peer:discovery.
    await wirePair(sender, receiver);

    const sessions = await sender.listSessions();
    assert.deepEqual(sessions.map((session) => session.id).sort(), ["receiver-id", "sender-id"]);
    assert.partialDeepStrictEqual(sessions.find((session) => session.id === "receiver-id"), {
      hostname: "remote-device",
      os: "Linux arm64",
      sshRemote: "root@device.local",
    });

    const received = new Promise<string>((resolve) => {
      receiver.once("message", (_from, message) => resolve(message.content.text));
    });
    const result = await sender.send("receiver-id", { text: "hello over p2p" });

    assert.equal(result.delivered, true);
    assert.equal(await received, "hello over p2p");
  } finally {
    await Promise.allSettled([sender.disconnect(), receiver.disconnect()]);
    if (previousKey === undefined) delete process.env.PI_INTERCOM_P2P_KEY;
    else process.env.PI_INTERCOM_P2P_KEY = previousKey;
  }
});

test("p2p requests time out when a peer stops responding", async () => {
  const previousKey = process.env.PI_INTERCOM_P2P_KEY;
  const previousTimeout = process.env.PI_INTERCOM_P2P_TIMEOUT_MS;
  process.env.PI_INTERCOM_P2P_KEY = "test-shared-key-1234";
  const sender = new P2PIntercomClient();
  const receiver = new P2PIntercomClient();

  try {
    await sender.connect(registration("sender"), "sender-id");
    await receiver.connect(registration("receiver"), "receiver-id");
    await wirePair(sender, receiver);
    process.env.PI_INTERCOM_P2P_TIMEOUT_MS = "100";
    Reflect.set(receiver, "handleStream", async () => {});

    await assert.rejects(sender.send("receiver-id", { text: "no reply" }), /timed out/i);
  } finally {
    await Promise.allSettled([sender.disconnect(), receiver.disconnect()]);
    if (previousKey === undefined) delete process.env.PI_INTERCOM_P2P_KEY;
    else process.env.PI_INTERCOM_P2P_KEY = previousKey;
    if (previousTimeout === undefined) delete process.env.PI_INTERCOM_P2P_TIMEOUT_MS;
    else process.env.PI_INTERCOM_P2P_TIMEOUT_MS = previousTimeout;
  }
});

test("p2p prunes routes for a disconnected peer after session rebinding", async () => {
  const previousKey = process.env.PI_INTERCOM_P2P_KEY;
  process.env.PI_INTERCOM_P2P_KEY = "test-shared-key-1234";
  try {
    const client = new P2PIntercomClient();
    const peer = (id: string) => ({ toString: () => id, equals: (other: { toString(): string }) => other.toString() === id });
    const oldPeer = peer("old-peer");
    const newPeer = peer("new-peer");
    const session = { ...registration("peer"), id: "peer-id", endpointEpoch: "old" };
    Reflect.set(client, "_sessionId", "self-id");
    Reflect.apply(Reflect.get(client, "upsertPeer"), client, [oldPeer, session]);
    Reflect.get(client, "inboundRoutes").set("inbound", oldPeer);
    Reflect.get(client, "outboundRoutes").set("outbound", oldPeer);
    Reflect.apply(Reflect.get(client, "upsertPeer"), client, [newPeer, { ...session, endpointEpoch: "new" }]);

    Reflect.apply(Reflect.get(client, "removePeer"), client, [oldPeer]);

    assert.equal(Reflect.get(client, "inboundRoutes").has("inbound"), false);
    assert.equal(Reflect.get(client, "outboundRoutes").has("outbound"), false);
    assert.equal(Reflect.get(client, "sessionByPeer").get("new-peer"), "peer-id");
    const cancelled = await client.cancelMessage("outbound");
    assert.equal(cancelled.delivered, false);
    assert.match(cancelled.reason ?? "", /no longer connected/i);
  } finally {
    if (previousKey === undefined) delete process.env.PI_INTERCOM_P2P_KEY;
    else process.env.PI_INTERCOM_P2P_KEY = previousKey;
  }
});
