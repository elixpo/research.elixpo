# Elixpo Research

The standalone publication surface for Elixpo open research. It presents papers,
technical reports, experiments, code, datasets, models, demonstrations,
reproducibility notes, and explicit review status without acting as a journal or
claiming peer review.

## Source of truth

Research facts originate in `elixpo/elixpo/content/research.json`. This repository
keeps a reviewed static snapshot under `content/` so builds remain deterministic.
The snapshot records the exact canonical source commit.

```bash
npm run registry:sync
npm run registry:check
```

Registry updates are committed and reviewed here; the site never silently fetches
mutable organization facts during a production build.

## Development

```bash
npm ci
npm run dev
```

Use `npm run lint`, `npm run typecheck`, and `npm run build` before release. The
production build is a static export in `out/` suitable for the
`research.elixpo.com` deployment.

## Releases

The publication surface is released through the repository's
[GitHub release history](https://github.com/elixpo/research.elixpo/releases).
Research artifacts keep their own versions and release histories in their
owning repositories; a site release does not create a new scientific release.

## Publication boundary

- Owning research repositories remain authoritative for source and evidence.
- The main Elixpo registry owns classification and editorial research metadata.
- This repository owns research-specific presentation, citation exports, feeds,
  crawl metadata, and deployment.
- “Peer reviewed” is shown only when the registry records an external peer-review
  process.

Elixpo Research does not accept public submissions in this first version.

## Contribution, support, and governance

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before proposing changes. Public
support boundaries are in [SUPPORT.md](./SUPPORT.md), private vulnerability
reporting is described in [SECURITY.md](./SECURITY.md), and repository authority
is defined in [GOVERNANCE.md](./GOVERNANCE.md).

## License

The publication-site source is MIT licensed. Linked papers, datasets, models,
hardware, demonstrations, and Elixpo brand material retain their separately
stated terms; see [NOTICE](./NOTICE).
