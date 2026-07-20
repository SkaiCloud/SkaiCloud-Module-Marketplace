# Module Marketplace

Module Marketplace is the discovery and package-review surface for the SkaiCloud Network Solution Platform.

## Version 0.1.4

This package provides a UI contract for:

- browsing featured and verified modules,
- searching and filtering the module catalog,
- displaying publisher, compatibility, trust, and lifecycle status,
- routing package requests into the platform review workflow,
- showing enabled and pending module counts.
- showing the live, host-verified connection state to SkaiCloud Network Command.

## Runtime boundary

The installable interface runs as static HTML, CSS, and JavaScript inside the host-controlled sandboxed iframe. It does not run package scripts, apply migrations, dynamically load TypeScript components, or write platform runtime files. The Command bearer token remains in the host backend; the iframe receives only a sanitized connection result through the host bridge. The `Review package` action represents the platform inspection, preflight, and dry-run workflow.

## Data ownership

Module Marketplace owns no database tables, settings keys, or upload paths. It can be disabled with no data deletion.
