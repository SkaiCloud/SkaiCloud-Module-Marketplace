import { createHash, createSign, generateKeyPairSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const moduleRoot = path.resolve(process.argv[2] || ".");
const keyRoot = path.resolve(process.argv[3] || ".publisher-keys");
const manifestPath = path.join(moduleRoot, "module.json");
const packageRoot = path.join(moduleRoot, "package");
const signatureRelativePath = "package/SIGNATURE.txt";
const signaturePath = path.join(moduleRoot, ...signatureRelativePath.split("/"));
const privateKeyPath = path.join(keyRoot, "skaicloud-network-llc-private.pem");
const publicKeyPath = path.join(keyRoot, "skaicloud-network-llc-public.pem");

function packageFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? packageFiles(absolutePath) : [absolutePath];
  });
}

function canonicalContentDigest() {
  const entries = packageFiles(packageRoot)
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

  return hash.digest("hex");
}

function ensurePublisherKeyPair() {
  const privateExists = fs.existsSync(privateKeyPath);
  const publicExists = fs.existsSync(publicKeyPath);
  if (privateExists !== publicExists) {
    throw new Error("Publisher key pair is incomplete; restore both key files before signing.");
  }
  if (privateExists) return;

  fs.mkdirSync(keyRoot, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 3072 });
  fs.writeFileSync(privateKeyPath, privateKey.export({ type: "pkcs8", format: "pem" }), { flag: "wx", mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey.export({ type: "spki", format: "pem" }), { flag: "wx" });
}

if (!fs.existsSync(manifestPath) || !fs.existsSync(packageRoot)) {
  throw new Error("Expected module.json and package/ under the module root.");
}

ensurePublisherKeyPair();

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const digest = canonicalContentDigest();
manifest.package = {
  ...manifest.package,
  checksum: `sha256:${digest}`,
  signature: signatureRelativePath,
};

const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
fs.writeFileSync(manifestPath, manifestText);

const signer = createSign("RSA-SHA256");
signer.update(manifestText);
signer.end();
const signature = signer.sign(fs.readFileSync(privateKeyPath)).toString("base64");
fs.writeFileSync(signaturePath, `${signature}\n`);

const publicKey = fs.readFileSync(publicKeyPath, "utf8").trim().replace(/\r\n/g, "\n");
const fingerprint = createHash("sha256").update(publicKey).digest("hex");

console.log(JSON.stringify({
  module: manifest.key,
  version: manifest.version,
  checksum: manifest.package.checksum,
  signature: signatureRelativePath,
  publicKeyPath,
  privateKeyPath,
  fingerprint,
}, null, 2));
