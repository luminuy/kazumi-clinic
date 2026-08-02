#!/usr/bin/env bash
# Dumps every blog post's Thai title/excerpt/body from production D1 as flat JSON for translation.
# Unlike the service catalogue (a hand-maintained TS file), blog posts only exist in D1 — the
# clinic writes them through /admin — so extraction has to go over the network.
#
#   bash scripts/i18n/blog-extract.sh > /tmp/blog-th.json

set -euo pipefail
DB="${1:-kazumi-clinic-tag-cache}"

npx wrangler d1 execute "$DB" --remote \
  --command "SELECT id, slug, title, excerpt, body FROM posts ORDER BY id" \
  --json |
  node -e '
    const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const rows = data[0].results;
    const posts = Object.fromEntries(
      rows.map((r) => [r.id, { title: r.title, excerpt: r.excerpt ?? "", body: r.body }]),
    );
    process.stdout.write(JSON.stringify({ posts }, null, 2) + "\n");
    process.stderr.write(`extracted ${rows.length} post(s)\n`);
  '
