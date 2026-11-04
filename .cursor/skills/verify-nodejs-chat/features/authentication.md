# Register and log in

Register and log in is a user-facing part of nodejs-chat.

## Sub-features

- `authentication`: Helper creates a disposable local user, rejects duplicate registration and wrong/missing credentials, then gets a valid login token. Browser mode submits /register.

## How to get to it (user POV)

Open /register or /login; submit Username and Password.

## Driving it with verify-nodejs-chat

Preconditions: launch and doctor pass on the helper-owned disposable instance.

Helper creates a disposable local user, rejects duplicate registration and wrong/missing credentials, then gets a valid login token. Browser mode submits /register. Run `node .cursor/skills/verify-nodejs-chat/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

All users are in-memory and disappear on shutdown. Browser login token response is JSON, not a chat UI. Current JWT/session signing strings are development defaults; not production auth.
