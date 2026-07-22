# Post-Install Checks

1. Enable `marketplace` for a test role.
2. Open `/dashboard/marketplace` and confirm the catalog renders.
3. Confirm the Command connection indicator turns green and reports the published module count.
4. Click the connection indicator and confirm it refreshes without exposing a bearer token to the iframe.
5. Search for a module and confirm the result count updates.
6. Select each category and confirm only matching modules remain.
7. Confirm trust, compatibility, publisher, and lifecycle status are visible.
8. Confirm paid one-time modules show **Buy once** when unowned and **Owned** after Command entitlement refresh.
9. In Stripe test mode, open Checkout and confirm cancellation does not grant ownership.
10. Complete a Stripe test payment and confirm Command grants a permanent entitlement before installation.
11. Disable `marketplace` and confirm its navigation item is hidden.
12. Confirm disabling the module does not remove registered module metadata.
