import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

export function uploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

export function maxBytes() {
  const mb = Number(process.env.MAX_UPLOAD_MB || 8);
  return mb * 1024 * 1024;
}

export async function saveUpload(file: File, folder: string) {
  if (!ALLOWED.has(file.type)) {
    throw Object.assign(new Error("Намуди файл иҷозат дода намешавад"), { status: 400 });
  }
  if (file.size > maxBytes()) {
    throw Object.assign(new Error("Ҳаҷми файл аз ҳад зиёд аст"), { status: 400 });
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(uploadRoot(), folder);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  return `/api/uploads/${folder}/${name}`;
}
