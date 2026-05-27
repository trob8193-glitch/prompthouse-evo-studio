# Security Policy

## Reporting Vulnerabilities

PromptHouse Evo Studio is a sovereign AI development platform. Security is critical to protecting user privacy and system integrity.

### Responsible Disclosure

If you discover a security vulnerability, **please report it privately** using GitHub's security advisory feature:

1. Go to **Security** → **Advisories** → **Report a vulnerability**
2. Or email: `security@prompthouse-studio.local`

**Do NOT** open a public issue for security vulnerabilities.

### What We Cover

- Authentication & authorization flaws
- Data exposure or privacy leaks
- Cryptographic weaknesses
- API security issues
- Supply chain attacks (dependencies)
- Infrastructure/deployment vulnerabilities

### Response Timeline

- **Initial response**: Within 24 hours
- **Assessment**: Within 48 hours
- **Patch release**: ASAP (expedited process)
- **Public disclosure**: After patch is released

### Security Features (GitHub Pro Tier)

✅ **Enabled**:
- Dependabot vulnerability scanning
- Secret scanning with push protection
- Code scanning with CodeQL
- Branch protection rules
- Required status checks
- Dismiss stale PR approvals

## Building & Deployment Security

### API Key Management

- Never commit `.env` files with API keys
- Use GitHub Secrets for CI/CD: `OPENAI_API_KEY`, etc.
- Rotate keys quarterly
- Audit key usage logs

### Code Review Requirements

- All PRs require 2 approvals
- Status checks must pass (tests, lint, security)
- Branch protection enforced on `main`
- Force push disabled

### Supply Chain Security

- Signed commits required for releases
- Lockfile (`package-lock.json`) tracked
- Dependencies audited weekly (Dependabot)
- SBOM (Software Bill of Materials) generated per release

## Testing & Validation

Before pushing to `main`:

```bash
npm run lint        # ESLint
npm test            # Unit tests
npm audit           # Dependency audit
./scripts/diagnose.sh  # Studio diagnostics
```

## Data Privacy

- User data is private by default
- No external telemetry without consent
- Local-first storage (MemoryBox)
- Encrypted API key storage
- GDPR-compliant data handling

## Compliance

- Follows OWASP Top 10
- Compliant with Node.js best practices
- Uses industry-standard crypto libraries
- Regular security audits (GitHub Pro)

## Questions?

Open a GitHub Discussion or contact the PromptHouse Studio Owner team.

---

**Last Updated**: 2026-05-04  
**Policy Version**: 1.0
