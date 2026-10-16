# Contributing to Elixpo Research

Thank you for helping make public research easier to inspect and reproduce.

## Choose the correct source

- Correct research facts, authorship, lifecycle, review status, or artifact
  links in the canonical `elixpo/elixpo` content registry first.
- Correct experiment code, paper source, data, or models in the owning research
  repository.
- Change research-page presentation, citation export, feeds, accessibility, or
  deployment behaviour in this repository.

This separation prevents the publication site from silently overriding the
research record.

## Local checks

Use Node.js 24 and install the committed dependency graph with `npm ci`.

```bash
npm run registry:check
npm run lint
npm run typecheck
npm run build
```

The production build is a static export. Pull requests must not add server-only
runtime dependencies unless the deployment architecture is explicitly changed.

## Pull requests

Explain the reader-facing problem, identify any affected research records, and
include screenshots for visual changes. Fork pull requests receive no secrets.
Automated checks are required; the repository currently requires zero approving
reviews by maintainer decision.

Do not describe work as peer reviewed unless the canonical record links an
external peer-review process.
