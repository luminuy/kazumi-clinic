#!/usr/bin/env node
// Turns a validated blog translation into a D1 SQL file (UPDATE posts SET *_en ... WHERE id = ...).
// Written to stdout — pipe into a file, then:
//   npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file=<file>.sql
//
//   node scripts/i18n/blog-apply.mjs <translation.json>

import { readFileSync } from 'node:fs';

const [, , translationPath] = process.argv;
if (!translationPath) {
  console.error('usage: blog-apply.mjs <translation.json>');
  process.exit(2);
}

const { posts } = JSON.parse(readFileSync(translationPath, 'utf8'));

// SQLite single-quote escaping: double the quote.
const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;

const statements = Object.entries(posts).map(
  ([id, post]) =>
    `UPDATE posts SET title_en = ${sqlString(post.title)}, excerpt_en = ${sqlString(post.excerpt ?? '')}, body_en = ${sqlString(post.body)} WHERE id = ${sqlString(id)};`,
);

process.stdout.write(`${statements.join('\n')}\n`);
console.error(`wrote ${statements.length} UPDATE statement(s)`);
