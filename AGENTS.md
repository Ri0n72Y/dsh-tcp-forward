# AGENTS.md

- Keep this plugin minimal.
- Prefer Node.js standard library; do not add dependencies unless necessary.
- Use public DSH and Cordis APIs only.
- Keep TCP forwarding transparent: do not parse or rewrite forwarded traffic.
- Own external resources through Cordis lifecycle (`ctx.effect`).
- Keep implementation in `src/` and keep README concise.
- Run `npm test` after behavior changes.
