# DevTrack project

DevTrack is a small, responsive issue tracker and technical assessment of an
actual multi-agent engineering workflow. A registered user can manage their
own issues in a searchable Kanban board. Notifications, payments, and
real-time collaboration are outside scope.

The Orchestrator owns requirements, task scope, and integration. Develop
implements application changes. Testing owns independent validation and
reports. The human supervisor owns commits and authorizes phase transitions
where specified and external operations when required.

Delivery includes the GitHub repository, native agent configuration, source
code, PostgreSQL migrations, automated tests, CI, deployment documentation,
and actual workflow and validation records. The production site must be public
on Vercel and use free Supabase and Vercel plans. Evaluators receive credentials
for a dedicated non-privileged demo user separately.

- [Requirements and acceptance criteria](REQUIREMENTS.md)
- [Architecture](ARCHITECTURE.md)
- [Backlog](TASKS.md)
- [Agent workflow](AGENT_WORKFLOW.md)
- [Testing strategy](TEST_STRATEGY.md)
