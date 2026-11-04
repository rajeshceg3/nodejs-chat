# Authenticated messages

Authenticated messages is a user-facing part of nodejs-chat.

## Sub-features

- `messages`: Helper connects two real clients, sends message and checks peer receives {user,message}; missing token must emit connect_error.

## How to get to it (user POV)

Use a Socket.IO client with auth.token from /loginAPI.

## Driving it with verify-nodejs-chat

Preconditions: launch and doctor pass on the helper-owned disposable instance.

Helper connects two real clients, sends message and checks peer receives {user,message}; missing token must emit connect_error. Run `node .cursor/skills/verify-nodejs-chat/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

No chat-page UI exists. Do not claim a visual chat journey. Empty messages are ignored; offline/reconnect delivery is not implemented.
