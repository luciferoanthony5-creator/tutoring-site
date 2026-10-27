# Syndor workspace for this project

The user sets the task → GPT-6 Astra in Codex plans → Claude Code implements →
Astra reviews → Claude addresses findings. Use one shared project channel so
the user can follow the decisions and results.

## One-time setup

1. Open https://syndor.dev/auth, create a workspace named `Tutoring Site`, and
   complete email verification (or use your existing workspace).
2. In **People & agents**, create two agent identities: `Astra Planner` and
   `Claude Implementer`. Put both in a `tutoring-site` channel, or use `general`
   if channel creation isn't available.
3. Obtain each agent's generated setup prompt. Keep the unique MCP server name
   and private connector URL from that prompt. Each role needs a different URL.
4. From the repository root, enter each connection locally:

   ```bash
   python3 scripts/syndor.py setup planner
   python3 scripts/syndor.py setup implementer
   ```

The URL input is hidden. Connections are stored in ignored `.syndor/` files
with owner-only permissions. The launcher adds the connection for that session;
it does not register either identity globally. Connection URLs are credentials:
don't put them into chat, tracked files, screenshots or shared logs. The CLI
receives its connector through process arguments, so use a trusted local machine.

Sign in to both CLIs using their own login flows if needed (`codex login` and
`claude auth login`). Model availability depends on your account. The planner
requests exactly `gpt-6-astra`; if access fails, resolve account access rather
than silently changing models.

## Start work

Open two terminals in this repository:

```bash
# Terminal 1: GPT-6 Astra, extra-high reasoning, read-only repository access.
python3 scripts/syndor.py start planner
```

```bash
# Terminal 2: Claude Code, using its existing model and permission settings.
python3 scripts/syndor.py start implementer
```

Accept normal project trust/MCP prompts as needed. Give each session its own
Syndor-generated setup instructions too, especially any polling instructions.
The launcher supplies the role prompt in this folder. Existing user MCP settings
still apply; remove any old Syndor connection using the wrong agent identity.

In each client, confirm that `syndor_workspace` returns the intended workspace
and identity, and that `syndor_agent_guide` succeeds. Ask each agent to say hello
in the project channel, then send this in Syndor (mention the actual identities):

> Astra Planner: plan my next task for this tutoring site. Claude Implementer:
> implement Astra's plan and report validation. Astra: review the resulting diff.
> Task: [describe the change you want].

Use a task ID and plan version to connect PLAN → IMPLEMENTED → ACCEPTED or
CHANGES REQUESTED. The implementer is the only repository writer; the planner's
read-only sandbox helps prevent simultaneous edits. Both see the same working
tree, including uncommitted changes. Plans within the user's task can proceed
directly; the user still handles pushing as specified in CLAUDE.md.

Syndor does not run the models or wake closed sessions. Both clients must remain
open, follow the generated polling routine, and run on a machine that stays awake.
This launcher starts interactive sessions; it isn't an unattended agent service.

## References

- [Syndor setup and agent lifecycle](https://syndor.dev/docs)
- [OpenAI Docs: GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra)
- [OpenAI Docs: Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp)

Live workspace creation, identity verification and message exchange remain
unverified until the two real connector URLs have been configured locally.
