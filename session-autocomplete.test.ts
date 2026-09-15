import assert from "node:assert/strict";
import test from "node:test";
import { createSessionAutocompleteProvider } from "./session-autocomplete.ts";
import type { SessionInfo } from "./types.ts";

const sessions = [
  { id: "self0000", name: "repo@host", cwd: "/repo", hostname: "host" },
  { id: "aaaa1111-rest", name: "api@host", cwd: "/work/api", hostname: "host" },
  { id: "bbbb2222-rest", name: "api@host", cwd: "/other", hostname: "remote" },
  { id: "cccc3333-rest", name: "web@host", cwd: "/work/web", hostname: "host" },
] as SessionInfo[];

function provider() {
  const delegated = { prefix: "delegated", items: [] };
  const current = {
    getSuggestions: async () => delegated,
    applyCompletion: () => ({ lines: [], cursorLine: 0, cursorCol: 0 }),
  } as any;
  return { delegated, autocomplete: createSessionAutocompleteProvider(current, async () => ({ selfId: "self0000", sessions })) };
}

test("session autocomplete targets unique names and duplicate short IDs", async () => {
  const { autocomplete } = provider();
  const result = await autocomplete.getSuggestions(["ask @@host"], 0, 10, { signal: new AbortController().signal } as any);
  assert.deepEqual(result?.items.map((item) => item.value), ["@aaaa1111", "@bbbb2222", "@web@host"]);
});

test("session autocomplete delegates outside double-at mentions", async () => {
  const { delegated, autocomplete } = provider();
  const options = { signal: new AbortController().signal } as any;
  assert.equal(await autocomplete.getSuggestions(["email@example"], 0, 13, options), delegated);
  assert.equal(await autocomplete.getSuggestions(["ask @host"], 0, 9, options), delegated);
});

test("session autocomplete never falls back to files after double-at", async () => {
  const { autocomplete } = provider();
  const controller = new AbortController();
  controller.abort();
  assert.equal(await autocomplete.getSuggestions(["@@api"], 0, 5, { signal: controller.signal } as any), null);
  assert.equal(await autocomplete.getSuggestions(["@@missing"], 0, 9, { signal: new AbortController().signal } as any), null);
});
