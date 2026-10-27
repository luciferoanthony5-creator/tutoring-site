# Manual workflow: Codex plans, Claude implements

Use a Markdown task file to pass work between two interactive terminal sessions.
Codex improves the request, plans the change, and reviews the result. Claude Code
implements the plan and records validation. You tell each session when to read the
file. No SYNDOR connection or background service is required.

## Instructions for an AI reading this file

This is the workflow guide, not a task to implement. Read it at the start of each
session and follow the section for your role:

- **ChatGPT or Codex: planner and reviewer.** Improve the user's request, inspect
  project context, write a concrete plan, and later review Claude's implementation.
  ChatGPT and Codex are alternatives for this role, not two required planning agents.
- **Claude Code: implementer.** Read the selected task's plan, implement it, validate
  it, and record the results for review.

Use the role the user explicitly gives you if it differs from this default. Read
applicable `AGENTS.md` guidance, `CLAUDE.md`, `claude/website-plan.md`, and
`claude/progress-log.md`. Use this guide for the manual handoff procedure; do not
start the older SYNDOR workflow because another project file mentions it.

If the user only says to read this guide, confirm your role and readiness in a
short response, then ask for their task or the exact task file to resume. Do not
start implementing, create a sample task, or resume an old task merely because it
exists. If the user's message already includes a task and an action, proceed with
that action without asking them to repeat it.

At every handoff, reread the selected task file from disk. Work one turn at a time;
do not poll, contact the other agent, or assume another session has seen your
changes. Finish each work turn with the task path, status, a short result, and the
exact next prompt the user can paste into the other terminal when a handoff is
needed. For a completed task, report acceptance without inventing another step.

## Start a work session

Open two terminals in `/home/anthony/dev/tutoring-site`:

```bash
# Terminal 1: planner and reviewer
codex
```

```bash
# Terminal 2: implementer
claude
```

Use the regular CLIs rather than `scripts/syndor.py start ...`, which supplies
SYNDOR-specific instructions. Keep both sessions in the same working tree.
Neither agent wakes automatically when the other updates a file.

### Startup prompt for Codex

Paste into the Codex session:

```text
Read MANUAL-WORKFLOW.md in this project's root and the project guidance it names.
You are my planner and reviewer. Help me turn requests into clear, practical plans
in claude/plans/, then review Claude Code's implementation against those plans.
When saving the first task, create claude/plans/ if it does not exist. Keep all
task plans there, one file per task, and preserve existing plans.
Claude Code owns application edits; you may edit the task files to record plans
and reviews. We hand off manually through Markdown, one agent at a time.
Confirm you understand your role and ask for my task or task file. Do not resume
existing work just because it is present. End future handoffs with the exact
prompt I should give Claude.
```

### Startup prompt for ChatGPT, if used for planning

If this session cannot read the project directly, provide this guide and the
relevant project files as attachments or pasted text. Use this prompt in place of
the Codex startup prompt when ChatGPT is your planner:

```text
Read MANUAL-WORKFLOW.md and the project context I provide. You are my planner and
reviewer; Claude Code implements. Help clarify my requests, produce versioned
Markdown task plans using the guide's template, and review the implementation
evidence I bring back. Our handoffs are manual. If you can access the project,
inspect the relevant files and save plans and reviews to the selected task file.
If you cannot, ask for the specific missing files or diffs and give me the exact
Markdown to save or merge into the task file. Do not claim you inspected or saved
anything you could not access. Confirm your role and ask for my task or task file.
End future handoffs with the exact prompt I should give Claude.
```

When using ChatGPT without project access, save its plan into the task file before
asking Claude to implement. For review, provide the current task file, relevant
diffs, changed-file content as needed, and validation results. Copy the review back
into the file without overwriting Claude's results. Acceptance requires enough
evidence to assess the actual changes; ask for missing evidence when needed.

### Startup prompt for Claude Code

Paste into the Claude Code session:

```text
Read MANUAL-WORKFLOW.md in this project's root and the project guidance it names.
You are my implementer. ChatGPT/Codex plans and reviews; you implement the selected
plan, run appropriate checks, and record results in the same Markdown task file.
Our handoffs are manual, one agent at a time. Preserve existing unrelated work.
Confirm you understand your role and ask which task file to implement or resume.
Do not start editing until I give you that task and action. End future handoffs
with the exact prompt I should give the planner. Leave pushing and publishing to me.
```

In any new terminal session, the short startup instruction
**“Read MANUAL-WORKFLOW.md”** loads these role rules. Include the task path and
action in the same message when you want to begin immediately.

## Responsibilities

- **You:** set the task, answer material questions, trigger handoffs, and push or
  publish when ready.
- **Planner (ChatGPT/Codex):** inspect relevant source files; clarify and improve
  the request; create the shared plans folder when needed; write and revise the
  task's plan and review sections. Do not change application code or commit
  during planning and review.
- **Claude Code:** read the latest plan, implement the requested change, run
  appropriate checks, and update the implementation section. Follow `CLAUDE.md`
  for project conventions and commits; leave pushing and publishing to you.

The planner can edit the task document to record plans and reviews. Claude can
edit it to record results. Give only one agent a turn at a time so they do not
overwrite each other's changes. Work stays within your requested scope; material
scope changes or unclear requirements come back to you.

## One task, one file

**Codex owns creating and maintaining the plans folder.** Before saving a new
task, check for `claude/plans/` in the project root. If it is missing, create it:

```bash
mkdir -p claude/plans
```

Keep all task plans in this one project folder, including completed plans. Reuse
the folder across sessions. Update existing files only for their original task;
do not erase their history or reuse their names for a different task.
Keep plan revisions, implementation results, and review rounds in the same task
file rather than making a separate file for each handoff. This guide stays in the
project root; it is not a task plan. If the planner cannot write local files, the
user saves its Markdown into this folder before handing the task to Claude.

Store each task at `claude/plans/<task-id>.md`. Use an existing task's ID when
continuing it; for new tasks, choose an unused ID such as `TASK-001` or `MENU-002`.
The examples below use `TASK-001`; replace it with the actual task ID.
The file is the shared record; terminal conversation alone is not a handoff.

Always identify the task by its path or ID. Do not choose the "latest" task by
filename or modification time. If the user's intended task is unclear, ask once.

### 1. Ask the planner to plan

Paste this into the Codex terminal, replacing the request and task number:

> Read MANUAL-WORKFLOW.md and the project guidance. My request: [describe the
> change]. Inspect the relevant files and existing diff. Improve this into a
> concrete plan. Create claude/plans/ if needed and save the plan to
> claude/plans/TASK-001.md using the template in the guide. Preserve existing
> plans. Include acceptance criteria and appropriate validation. Only create the
> plans folder and edit this task document. Ask me about material ambiguities
> before finalizing the plan.

Read the plan. If needed, ask Codex to revise it before handing it to Claude.
Increment the plan version when its scope, approach, or acceptance criteria change.
Record the starting Git commit and relevant pre-existing edits so review can
distinguish task changes from earlier work. An unresolved material question makes
the task BLOCKED; a complete plan ready for implementation is PLANNED. Revising a
plan invalidates any earlier acceptance until the new version is implemented and
reviewed.

### 2. Ask Claude to implement

Paste this into the Claude Code terminal:

> Read MANUAL-WORKFLOW.md and claude/plans/TASK-001.md. Implement the latest plan
> within my requested scope. Inspect the existing working tree and preserve
> unrelated changes. Run the planned checks that are appropriate and available.
> Update Implementation results with the plan version, changed files, actual
> validation results, and any limitations. Set status to IMPLEMENTED when ready
> for review, or BLOCKED if you cannot proceed. Do not push or publish.

Before editing, set status to IN PROGRESS and record the plan version being
implemented. Update results with enough detail to resume if interrupted. Handle
routine implementation choices directly. For material changes to the plan, record
the issue and hand back to the planner. Follow `CLAUDE.md` for commits, include only
task-owned changes, and record any resulting commit IDs for review.

If blocked, resolve the question yourself or ask Codex to revise the plan, then
prompt Claude again. Neither agent should treat a plan as authority to expand
the task beyond your request.

### 3. Ask Codex to review

Paste this into the Codex terminal:

> Read claude/plans/TASK-001.md, inspect the actual changed files, task commits,
> and uncommitted diff, and review Claude's implementation against the latest plan
> and acceptance criteria.
> Check the reported validation and record any checks you perform. Only edit the
> task document. Write ACCEPTED or CHANGES REQUESTED in Review and update Status.
> For each finding, give the file location, concrete issue, and required outcome.

Codex must inspect the implementation rather than accepting Claude's summary
alone. A clean working tree is not proof that there were no changes: review any
recorded task commits as well. Check that the implementation matches the current
plan version. Keep reviews scoped to task changes, using the recorded starting
state to exclude unrelated edits. If required evidence is missing, record the gap
and request it before accepting. Distinguish checks actually run from checks merely
recommended. Acceptance means the work meets the task's criteria; it does not mean
it has been published.

### 4. Address findings if needed

If the status is CHANGES REQUESTED, send Claude:

> Read the latest Review in claude/plans/TASK-001.md. Address its findings within
> the task scope, rerun affected checks, and update Implementation results. Set
> status back to IMPLEMENTED when ready. Do not push or publish.

Then ask Codex to review again. Keep earlier findings and record how they were
resolved. If the fix requires a changed plan, have Codex revise and version it
before Claude implements it.

Once ACCEPTED, report completion and stop. Wait for the user's next task. The
user handles pushing and publication.

## Task document template

```markdown
# TASK-001: [Short title]

Status: PLANNED
Plan version: v1

## User request
[Original request and any clarifications from the user.]

## Starting state
Starting Git commit: [hash]
Relevant pre-existing edits: [paths and changes to preserve]

## Plan — Planner
### Goal
[Expected behavior and why it matters.]

### Scope and files
[Concrete changes, relevant paths, and scope boundaries.]

### Implementation steps
1. [Step grounded in inspected source files.]

### Acceptance criteria
- [Observable outcome required for completion.]

### Validation
- [Checks or commands appropriate to this change.]

### Open questions
[Material unresolved questions, or None.]

## Implementation results — Claude
Implemented plan version: [version]
Changed files: [paths and purposes]
Task commits: [hashes, or None; note any remaining uncommitted task changes]
Validation performed: [actual commands/checks and outcomes]
Validation not performed: [checks and reasons, or None]
Limitations or blockers: [details, or None]
Review findings addressed: [references and resolution, if applicable]
Next step if interrupted: [remaining work, or Ready for review]

## Review — Planner
Review round: [number; append a new round on re-review]
Reviewed plan version: [version]
Decision: [ACCEPTED or CHANGES REQUESTED]
Evidence: [files inspected, checks performed, and remaining validation gaps]
Findings: [file locations, issues, and required outcomes, or None]

## Plan revisions
- v1: Initial plan.
```

Use statuses `PLANNED`, `IN PROGRESS`, `IMPLEMENTED`, `CHANGES REQUESTED`,
`ACCEPTED`, and `BLOCKED`. Identify the blocking question or dependency whenever
using BLOCKED.

## Resume after closing terminals or restarting

Start `codex` and `claude` again from the project folder. Tell each agent to read
this guide and the current task file. Inspect the actual working tree before
continuing, especially if a previous run stopped partway through a change.

You do not need to recreate plans or reconfigure connections. Resume with the
next handoff appropriate to the task's status.

| Task status | Next action |
| --- | --- |
| PLANNED | Ask Claude to implement the named task. |
| IN PROGRESS | Ask Claude to inspect existing progress and continue the named task. |
| IMPLEMENTED | Ask the planner to review the named task. |
| CHANGES REQUESTED | Ask Claude to address the latest review findings. |
| BLOCKED | Resolve the recorded question or dependency, then resume the appropriate role. |
| ACCEPTED | The task is complete; give the planner a new request when ready. |
