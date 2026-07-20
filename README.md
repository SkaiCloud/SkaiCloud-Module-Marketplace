# SkaiCloud Module Marketplace

Signed, sandboxed Module Marketplace for the SkaiCloud Network platform.

## Current release

- Version: `0.1.3`
- Module key: `marketplace`
- Publisher: `SkaiCloud Network LLC`
- Runtime: host-controlled sandboxed iframe

## Install

1. Register the public key in SkaiCloud under **Settings → Trusted publishers**.
2. Set the publisher name exactly to `SkaiCloud Network LLC`.
3. Paste `https://github.com/SkaiCloud/SkaiCloud-Module-Marketplace` into **Automated Module Installer**, or choose the signed release ZIP.
4. Use branch `main` and select **Install Package**.

The installer performs archive inspection, compatibility validation, checksum comparison, RSA-SHA256 signature verification, sandbox extraction, backup, dry run, installation, and health checks in the backend.

## Repository layout

```text
module.json
package/
  README.md
  SIGNATURE.txt
  components/
  docs/
  routes/
  web/
publisher/
  SkaiCloud-Network-LLC-public.pem
tools/
  sign-module.mjs
  verify-signed-module.mjs
```

Only `module.json` and `package/` belong in the installable ZIP. Private signing keys must remain outside Git and outside release archives.

## Validate

```powershell
node tools\verify-signed-module.mjs . publisher\SkaiCloud-Network-LLC-public.pem
```
