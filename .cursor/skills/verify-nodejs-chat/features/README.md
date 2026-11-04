# nodejs-chat verification map

Run from an isolated local checkout. Baseline: dependencies installed, no shared services or production data. Only the helper-owned processes may be driven. Evidence survives cleanup.

- [Register and log in](authentication.md)
- [Authenticated messages](messages.md)
- [Session lifecycle](session-lifecycle.md)

## Proof boundaries

The generation proof covers the safe helper recipe, not every mapped feature. No production or paid provider calls, deploys, or shared mutations are implied. Screenshots require VERIFY_BROWSER=1. Report remaining features as unverified until driven.
