#!/usr/bin/env bash
set -euo pipefail

# Elixpo Research build and Cloudflare Pages deployment helper.
# Deployment is delegated to the trusted GitHub Actions workflow so local
# shells never need the production Cloudflare credentials.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY="elixpo/research.elixpo"
WORKFLOW="deploy-cloudflare-pages.yml"
BRANCH="main"
DRY_RUN=false
DO_BUILD=false
DO_DEPLOY=false

usage() {
  cat <<'EOF'
Usage: ./deploy.sh --pages PHASE... [options]

Phases:
  build       Validate and build the static research site
  deploy      Dispatch the trusted Cloudflare Pages workflow

Options:
  --ref NAME  Git ref to deploy (default: main)
  --dry-run   Print commands without executing them
  -h, --help  Show this help

Examples:
  ./deploy.sh --pages build
  ./deploy.sh --pages build deploy
  ./deploy.sh --pages deploy --ref main
EOF
}

run() {
  if "$DRY_RUN"; then
    printf '[dry-run]'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

build_site() {
  echo '==> Validating Elixpo Research registry and frontend...'
  run npm run registry:check
  run npm run lint
  run npm run typecheck
  run npm run build
  if ! "$DRY_RUN" && [[ ! -f "$SCRIPT_DIR/out/index.html" ]]; then
    echo 'Error: static export out/index.html was not produced.' >&2
    exit 1
  fi
  echo '==> Research static export is ready in out/.'
}

deploy_site() {
  if ! "$DRY_RUN" && [[ -n "$(git -C "$SCRIPT_DIR" status --porcelain)" ]]; then
    echo 'Error: commit and push repository changes before production deployment.' >&2
    exit 1
  fi
  echo "==> Dispatching $WORKFLOW from $BRANCH..."
  run gh workflow run "$WORKFLOW" --repo "$REPOSITORY" --ref "$BRANCH"
  echo '==> Deployment dispatched. Track it with:'
  echo "    gh run list --repo $REPOSITORY --workflow $WORKFLOW --limit 1"
}

[[ $# -gt 0 ]] || { usage; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pages) ;;
    build) DO_BUILD=true ;;
    deploy) DO_DEPLOY=true ;;
    --ref)
      [[ $# -ge 2 ]] || { echo 'Error: --ref requires a value.' >&2; exit 1; }
      BRANCH="$2"
      shift
      ;;
    --dry-run) DRY_RUN=true ;;
    -h|--help|help) usage; exit 0 ;;
    *) echo "Error: unknown argument: $1" >&2; usage; exit 1 ;;
  esac
  shift
done

"$DO_BUILD" || "$DO_DEPLOY" || { echo 'Error: choose build, deploy, or both.' >&2; exit 1; }
cd "$SCRIPT_DIR"
"$DO_BUILD" && build_site
"$DO_DEPLOY" && deploy_site
