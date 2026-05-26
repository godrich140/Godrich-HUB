# Project Standards

## Execution And Sync

- Every implementation run must first modify and verify local code only.
- Do not commit to Git, push to a remote branch, deploy to a server, restart services, or reload server infrastructure until the user explicitly confirms that sync/deploy may proceed.
- Local verification may include builds, compile checks, static checks, and local smoke tests.
- After each local UI or service adjustment, start or reuse the local development service so the user can test the latest local result before any repository or server synchronization.
- Use the standard local frontend URL `http://localhost:5173/` unless the port is already occupied by another project instance.
- After local verification, report changed files, verification results, and any remaining risk, then wait for the user's confirmation before repository or server synchronization.
