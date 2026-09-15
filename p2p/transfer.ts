import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, mkdir, open, readdir, rename, rm } from "node:fs/promises";
import { basename, isAbsolute, join, resolve, sep } from "node:path";
import type { Stream } from "@libp2p/interface";
import { lpStream } from "@libp2p/utils";
import { getIntercomDirPath } from "../broker/paths.ts";

export const TRANSFER_PROTOCOL = "/pi-intercom/transfer/1.0.0";
export const MAX_TRANSFER_FRAME_BYTES = 1024 * 1024;
const DEFAULT_MAX_TRANSFER_BYTES = 512 * 1024 * 1024;
const MAX_TRANSFER_ENTRIES = 10_000;
const CHUNK_BYTES = 64 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface TransferManifestEntry {
  path: string;
  type: "file" | "directory";
  size?: number;
}

export interface TransferSource {
  manifest: TransferManifestEntry[];
  files: Array<{ path: string; absolutePath: string; size: number }>;
  totalBytes: number;
}

export interface TransferCompletion {
  type: "complete";
  transferId: string;
  files: Array<{ path: string; sha256: string }>;
}

export type TransferStream = ReturnType<typeof lpStream<Stream>>;

export function getMaxTransferBytes(): number {
  const configured = Number(process.env.PI_INTERCOM_P2P_MAX_TRANSFER_BYTES);
  return Number.isSafeInteger(configured) && configured > 0 ? configured : DEFAULT_MAX_TRANSFER_BYTES;
}

export function createTransferStream(stream: Stream): TransferStream {
  return lpStream(stream, { maxDataLength: MAX_TRANSFER_FRAME_BYTES, maxBufferSize: MAX_TRANSFER_FRAME_BYTES * 2 });
}

export function encodeTransferJson(value: unknown): Uint8Array {
  const bytes = encoder.encode(JSON.stringify(value));
  if (bytes.byteLength > MAX_TRANSFER_FRAME_BYTES) throw new Error(`P2P transfer metadata exceeds ${MAX_TRANSFER_FRAME_BYTES} bytes`);
  return bytes;
}

export function decodeTransferJson(value: { subarray(): Uint8Array }): unknown {
  return JSON.parse(decoder.decode(value.subarray()));
}

function validateRelativePath(path: string): string[] {
  if (!path || isAbsolute(path) || path.includes("\0") || path.includes("\\")) throw new Error(`Unsafe transfer path: ${path}`);
  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) throw new Error(`Unsafe transfer path: ${path}`);
  return segments;
}

export function validateTransferManifest(value: unknown): { manifest: TransferManifestEntry[]; totalBytes: number } {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TRANSFER_ENTRIES) throw new Error("Invalid transfer manifest entry count");
  const manifest: TransferManifestEntry[] = [];
  const paths = new Set<string>();
  const entryTypes = new Map<string, "file" | "directory">();
  let totalBytes = 0;
  for (const raw of value) {
    if (!raw || typeof raw !== "object") throw new Error("Invalid transfer manifest entry");
    const entry = raw as Record<string, unknown>;
    if (typeof entry.path !== "string" || (entry.type !== "file" && entry.type !== "directory")) throw new Error("Invalid transfer manifest entry");
    validateRelativePath(entry.path);
    const collisionKey = process.platform === "win32" || process.platform === "darwin" ? entry.path.toLowerCase() : entry.path;
    if (paths.has(collisionKey)) throw new Error(`Duplicate transfer path: ${entry.path}`);
    paths.add(collisionKey);
    entryTypes.set(collisionKey, entry.type);
    if (entry.type === "file") {
      if (!Number.isSafeInteger(entry.size) || (entry.size as number) < 0) throw new Error(`Invalid transfer file size: ${entry.path}`);
      totalBytes += entry.size as number;
      if (!Number.isSafeInteger(totalBytes) || totalBytes > getMaxTransferBytes()) throw new Error(`P2P transfer exceeds ${getMaxTransferBytes()} bytes`);
      manifest.push({ path: entry.path, type: "file", size: entry.size as number });
    } else {
      if (entry.size !== undefined) throw new Error(`Invalid directory size: ${entry.path}`);
      manifest.push({ path: entry.path, type: "directory" });
    }
  }
  for (const entry of manifest) {
    const segments = entry.path.split("/");
    for (let index = 1; index < segments.length; index++) {
      const parent = segments.slice(0, index).join("/");
      const key = process.platform === "win32" || process.platform === "darwin" ? parent.toLowerCase() : parent;
      if (entryTypes.get(key) === "file") throw new Error(`Transfer path is nested below a file: ${entry.path}`);
    }
  }
  return { manifest, totalBytes };
}

export async function buildTransferSource(inputPaths: string[], cwd: string): Promise<TransferSource> {
  if (inputPaths.length === 0) throw new Error("At least one transfer path is required");
  const manifest: TransferManifestEntry[] = [];
  const files: TransferSource["files"] = [];
  const roots = new Set<string>();

  const visit = async (absolutePath: string, transferPath: string): Promise<void> => {
    if (manifest.length >= MAX_TRANSFER_ENTRIES) throw new Error(`P2P transfer exceeds ${MAX_TRANSFER_ENTRIES} entries`);
    const stat = await lstat(absolutePath);
    if (stat.isSymbolicLink()) throw new Error(`Symlinks are not supported: ${absolutePath}`);
    if (stat.isDirectory()) {
      manifest.push({ path: transferPath, type: "directory" });
      const children = (await readdir(absolutePath)).sort();
      for (const child of children) await visit(join(absolutePath, child), `${transferPath}/${child}`);
      return;
    }
    if (!stat.isFile()) throw new Error(`Only regular files and directories can be transferred: ${absolutePath}`);
    manifest.push({ path: transferPath, type: "file", size: stat.size });
    files.push({ path: transferPath, absolutePath, size: stat.size });
  };

  for (const inputPath of inputPaths) {
    const absolutePath = resolve(cwd, inputPath);
    const root = basename(absolutePath);
    if (!root || root === sep || roots.has(process.platform === "win32" ? root.toLowerCase() : root)) throw new Error(`Duplicate or invalid transfer root: ${inputPath}`);
    roots.add(process.platform === "win32" ? root.toLowerCase() : root);
    await visit(absolutePath, root);
  }

  const { totalBytes } = validateTransferManifest(manifest);
  return { manifest, files, totalBytes };
}

export async function sendTransferFiles(
  framed: TransferStream,
  source: TransferSource,
  transferId: string,
  signCompletion: (completion: TransferCompletion) => unknown,
  signal?: AbortSignal,
): Promise<void> {
  const hashes: TransferCompletion["files"] = [];
  for (const file of source.files) {
    const hash = createHash("sha256");
    let sent = 0;
    for await (const chunk of createReadStream(file.absolutePath, { highWaterMark: CHUNK_BYTES, signal })) {
      const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
      sent += bytes.byteLength;
      if (sent > file.size) throw new Error(`File changed during transfer: ${file.absolutePath}`);
      hash.update(bytes);
      await framed.write(bytes, { signal });
    }
    if (sent !== file.size) throw new Error(`File changed during transfer: ${file.absolutePath}`);
    hashes.push({ path: file.path, sha256: hash.digest("hex") });
  }
  await framed.write(encodeTransferJson(signCompletion({ type: "complete", transferId, files: hashes })), { signal });
}

function safeDestination(root: string, relativePath: string): string {
  const destination = resolve(root, ...validateRelativePath(relativePath));
  if (destination !== root && !destination.startsWith(`${root}${sep}`)) throw new Error(`Unsafe transfer path: ${relativePath}`);
  return destination;
}

export async function receiveTransferFiles(
  framed: TransferStream,
  sessionId: string,
  transferId: string,
  manifestValue: unknown,
  verifyCompletion: (value: unknown) => TransferCompletion,
  signal?: AbortSignal,
): Promise<string> {
  if (validateRelativePath(transferId).length !== 1) throw new Error(`Unsafe transfer id: ${transferId}`);
  const { manifest } = validateTransferManifest(manifestValue);
  const inbox = join(getIntercomDirPath(), "inbox", encodeURIComponent(sessionId));
  const destination = join(inbox, transferId);
  const partial = join(inbox, `.partial-${transferId}`);
  await mkdir(inbox, { recursive: true, mode: 0o700 });
  await rm(partial, { recursive: true, force: true });
  await mkdir(partial, { mode: 0o700 });
  const hashes: TransferCompletion["files"] = [];

  try {
    for (const entry of manifest) {
      const path = safeDestination(partial, entry.path);
      if (entry.type === "directory") {
        await mkdir(path, { recursive: true, mode: 0o700 });
        continue;
      }
      await mkdir(resolve(path, ".."), { recursive: true, mode: 0o700 });
      const handle = await open(path, "wx", 0o600);
      const hash = createHash("sha256");
      let remaining = entry.size!;
      try {
        while (remaining > 0) {
          const frame = (await framed.read({ signal })).subarray();
          if (frame.byteLength === 0 || frame.byteLength > remaining) throw new Error(`Invalid data frame for ${entry.path}`);
          await handle.write(frame);
          hash.update(frame);
          remaining -= frame.byteLength;
        }
      } finally {
        await handle.close();
      }
      hashes.push({ path: entry.path, sha256: hash.digest("hex") });
    }

    const completion = verifyCompletion(decodeTransferJson(await framed.read({ signal })));
    if (completion.type !== "complete" || completion.transferId !== transferId || JSON.stringify(completion.files) !== JSON.stringify(hashes)) {
      throw new Error("P2P transfer integrity check failed");
    }
    try {
      await lstat(destination);
      throw new Error(`Transfer already exists: ${transferId}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    await rename(partial, destination);
    return destination;
  } catch (error) {
    await rm(partial, { recursive: true, force: true });
    throw error;
  }
}
