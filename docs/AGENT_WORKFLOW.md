# DevTrack agent workflow

Open a fresh Codex CLI session in the repository and trust it after reviewing
its project configuration. Phase 0 used Codex CLI 0.172.0. Project configuration
enables native subagents and permits two child threads. Standalone agent files
register the `develop` and `testing` names and instruct each thread to load the
role Markdown. Both inherit the parent model and permissions.

1. The Orchestrator records scope, acceptance criteria and dependencies.
2. Spawn the native `develop` role with the task ID, iteration and criteria.
   Develop reads its instructions and Testing's directives and reports local results.
3. Spawn the native `testing` role against the resulting change. Testing applies
   its own directives and records actual evidence in docs/reports/.
4. Apply the lifecycle in AGENTS.md. Integrate work after independent
   approval. The human supervisor owns commits. Record commit IDs and agent thread IDs in the task history.

For a read-only smoke check, ask Codex to spawn both custom types and have
each child read its required files and report the paths and its thread ID.
Use `/subagents` in the interactive CLI to inspect the threads. In CLI 0.172.0
the attempted ephemeral smoke run failed to load the parent rollout at spawn.
Use a normal persisted session for reproduction.

[Official Codex subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)
