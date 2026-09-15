import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildTransferSource, validateTransferManifest } from "./transfer.ts";

test("buildTransferSource creates a deterministic folder manifest", async () => {
  const root = await mkdtemp(join(tmpdir(), "pi-intercom-transfer-"));
  try {
    await mkdir(join(root, "bundle", "empty"), { recursive: true });
    await writeFile(join(root, "bundle", "b.txt"), "two");
    await writeFile(join(root, "bundle", "a.txt"), "one");

    const source = await buildTransferSource(["bundle"], root);

    assert.deepEqual(source.manifest, [
      { path: "bundle", type: "directory" },
      { path: "bundle/a.txt", type: "file", size: 3 },
      { path: "bundle/b.txt", type: "file", size: 3 },
      { path: "bundle/empty", type: "directory" },
    ]);
    assert.equal(source.totalBytes, 6);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("transfer manifests reject traversal and sources reject symlinks", async () => {
  assert.throws(() => validateTransferManifest([{ path: "../escape", type: "file", size: 1 }]), /unsafe/i);
  assert.throws(() => validateTransferManifest([
    { path: "file", type: "file", size: 1 },
    { path: "file/child", type: "file", size: 1 },
  ]), /nested below a file/i);
  const root = await mkdtemp(join(tmpdir(), "pi-intercom-transfer-"));
  try {
    await writeFile(join(root, "file.txt"), "data");
    await symlink(join(root, "file.txt"), join(root, "link.txt"));
    await assert.rejects(buildTransferSource(["link.txt"], root), /symlink/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
