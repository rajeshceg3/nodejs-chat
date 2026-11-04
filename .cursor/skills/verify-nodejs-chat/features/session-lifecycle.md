# Session lifecycle

Session lifecycle is a user-facing part of nodejs-chat.

## Sub-features

- `session-lifecycle`: Register on one instance, shut it down, start fresh and confirm account no longer exists.

## How to get to it (user POV)

Restart a disposable instance and retry the prior user.

## Driving it with verify-nodejs-chat

Preconditions: launch and doctor pass on the helper-owned disposable instance.

Register on one instance, shut it down, start fresh and confirm account no longer exists. Run `node .cursor/skills/verify-nodejs-chat/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

Source-confirmed in-memory design. Restart persistence is not a passing persistence feature; not driven by helper.
