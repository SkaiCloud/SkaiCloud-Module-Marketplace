import { createHash, createVerify } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const moduleRoot = path.resolve(process.argv[2] || ".");
const publicKeyPath = path.resolve(process.argv[3] || ".publisher-keys/skaicloud-network-llc-public.pem");
const manifestPath = path.join(moduleRoot, "module.json");
const manifestText = fs.readFileSync(manifestPath, "utf8");
const manifest = JSON.parse(manifestText);
const signatureRelativePath = manifest.package?.signature;

function packageFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? packageFiles(absolutePath) : [absolutePath];
  });
}

const entries = packageFiles(path.join(moduleRoot, "package"))
  .map((absolutePath) => ({
    absolutePath,
    relativePath: path.relative(moduleRoot, absolutePath).replace(/\\/g, "/"),
  }))
  .filter((entry) => entry.relativePath !== signatureRelativePath)
  .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

const hash = createHash("sha256");
hash.update("skaicloud-module-content-v1");
hash.update("\0");
for (const entry of entries) {
  const data = fs.readFileSync(entry.absolutePath);
  hash.update(entry.relativePath);
  hash.update("\0");
  hash.update(String(data.byteLength));
  hash.update("\0");
  hash.update(data);
  hash.update("\0");
}

const actualChecksum = `sha256:${hash.digest("hex")}`;
const signatureText = fs.readFileSync(path.join(moduleRoot, ...signatureRelativePath.split("/")), "utf8").replace(/\s+/g, "");
const verifier = createVerify("RSA-SHA256");
verifier.update(manifestText);
verifier.end();
const signatureOk = verifier.verify(fs.readFileSync(publicKeyPath), Buffer.from(signatureText, "base64"));
const checksumOk = actualChecksum === manifest.package?.checksum;

console.log(JSON.stringify({ checksumOk, signatureOk, declaredChecksum: manifest.package?.checksum, actualChecksum }, null, 2));
if (!checksumOk || !signatureOk) process.exit(1);
