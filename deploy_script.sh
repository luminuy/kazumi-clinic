#!/bin/bash
set -e

echo "1. Checking git status"
git status -s

echo "2. Linting"
pnpm lint

echo "3. Typechecking"
pnpm typecheck

echo "4. Building"
pnpm build

echo "5. Committing"
git add app components lib update_service_pages.py
git commit -m "style: apply new Apple design tokens to service pages, home, and about" || echo "Nothing to commit"

echo "6. Pushing and PR"
git push -u origin main || echo "Push failed or nothing to push"
# We skip gh pr create because we push directly to main to save time if this is the only branch, or we can use gh pr create if we are on a branch. Let's check branch.
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  gh pr create --title "Apply Apple design system to all pages" --body "Automated PR to align UI with Apple style." || echo "PR exists"
  gh pr merge --squash --auto --delete-branch || echo "Merge failed"
fi

echo "7. Stopping dev server"
pkill -f "pnpm dev" || true
pkill -f "next dev" || true

echo "8. Deploying to Cloudflare"
pnpm cf:deploy

echo "9. Verification"
curl -I https://kazumiclinic.com
curl -I https://kazumi-clinic.bankjack10452.workers.dev
