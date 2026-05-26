# Platform Ready Status

Current branch truth label: `NEEDS_REPAIR`

This branch adds Platform Sentinel, the studio's platform-readiness enforcement layer. It must pass GitHub Actions and local proof commands before any `PLATFORM_READY` claim is allowed.

## Required next proof

- `npm run platform:status`
- `npm run platform:strict`
- `npm run platform:receipt`
- `npm run audit:imports`
- `npm run audit:css`
- `npm run verify:studio`
- `npm test`
- `npm run build`
