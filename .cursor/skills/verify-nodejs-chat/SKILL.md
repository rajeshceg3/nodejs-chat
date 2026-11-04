---
name: verify-nodejs-chat
description: "Verify nodejs-chat's real user surface with isolated local processes, evidence and explicit external-service boundaries. Use before reporting behavior changes complete."
---

# Verify nodejs-chat

Generated from source interview following pstack create-verification-skill. Read features/README.md first.

## Launch

From repository root run `npm ci --ignore-scripts`, then `node .cursor/skills/verify-nodejs-chat/verify.cjs`. Browser proof: install Chromium with `npx playwright install chromium`, or set CHROME_BIN to an existing Chrome executable, then prefix the helper with VERIFY_BROWSER=1. Default mode proves HTTP/API behavior only. The helper reserves a free HTTP port, starts the real app and polls its own expected route until usable. It refuses shared data where applicable. No already-running instance is reused.

## Doctor

The helper checks its own child is running and GETs the app's mapped readiness route before driving: / for weather, /register for chat, /repos/verify-cache-user for Redis, /list for todo. It validates expected content/results during the drive. A TCP listener alone is not success. After surprising failure, clean up and rerun from a fresh instance, never attach to an unknown port.

## Drive

Run `node .cursor/skills/verify-nodejs-chat/verify.cjs`; add `VERIFY_BROWSER=1` for the documented browser path where available. Feature map distinguishes exercised entry points from still-unverified ones. No internal setters or test-only endpoints are used. Redis fixture seeding is explicitly isolated scaffolding for the real cache-hit path, not evidence of the external fetch path.

## Evidence

Default location is a unique /tmp/verify-nodejs-chat- directory, printed at exit. Set VERIFY_EVIDENCE_DIR to a new private persistent path to retain proof across host cleanup. evidence.json records request action, response/status, assertions, boundaries, failure and cleanup. Child logs remain alongside it. Browser mode saves before/after screenshots and requires no page errors. Token responses are redacted. Inspect actual pixels before calling visual behavior verified. One passing path never means the whole map or production passed.

## Cleanup

The helper signals only the processes it created, waits, escalates only on its own children and preserves evidence. Confirm cleaned:true and that evidence.json still exists. App state is disposable: memory users, local MongoMemoryServer, or isolated Redis. Never kill by process name, flush a shared DB, or remove evidence. Existing product logs are not proof to commit.

## Helpers

`node .cursor/skills/verify-nodejs-chat/verify.cjs` is executable and self-contained. Read error/result and exit code. Dependency, browser or Mongo binary failure is a blocker, not a skipped pass.

## Maintenance

After behavior changes use /maintain-verification-skill: reconcile every mapped feature with source and exercise each live; report unreachable prerequisites and product regressions rather than editing the map to hide them.
