#!/usr/bin/env node
// Fills in every messages/en.json value that is still Thai, using Gemini CLI.
//
//   node scripts/i18n/translate-messages.mjs           # dry run — lists what it would send
//   node scripts/i18n/translate-messages.mjs --write   # translate and write en.json
//
// The extraction step (moving hardcoded Thai into the catalogue) deliberately copies the Thai into
// en.json as a placeholder, so `pnpm i18n:check` stays red until this script has run. That red is
// the feature: a half-finished translation cannot reach main quietly.
//
// Every batch is validated before anything is written — placeholders preserved, numbers unchanged,
// no banned marketing claims (docs/i18n-glossary.md), no key invented or dropped. A batch that
// fails validation is reported and left untranslated rather than written half-right.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const EN_PATH = `${ROOT}/messages/en.json`;
const TH_PATH = `${ROOT}/messages/th.json`;
const PROMPT_PATH = `${ROOT}/scripts/i18n/prompt-messages.md`;

const WRITE = process.argv.includes('--write');
// Small enough that one bad batch is cheap to redo and the model keeps every key in view.
const BATCH_SIZE = 25;

const THAI = /[฀-๿]/;
const BANNED =
  /\b(guarantee\w*|permanent\w*|forever|cures?|cured|heals?|miracle\w*|risk[-\s]free|world[-\s]class|100%\s*(safe|effective))\b/i;
const PLACEHOLDERS = /\{[a-zA-Z0-9_]+\}/g;
const NUMBERS = /\d[\d,.]*/g;

const en = JSON.parse(readFileSync(EN_PATH, 'utf8'));
const th = JSON.parse(readFileSync(TH_PATH, 'utf8'));

const flatten = (node, prefix = '', out = {}) => {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') flatten(value, path, out);
    else out[path] = value;
  }
  return out;
};

const setPath = (node, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  let cursor = node;
  for (const key of keys) cursor = cursor[key];
  cursor[last] = value;
};

const flatEn = flatten(en);
const flatTh = flatten(th);
const pending = Object.keys(flatEn).filter((key) => THAI.test(String(flatEn[key])));

if (pending.length === 0) {
  console.log('nothing to translate — every en.json value is already English');
  process.exit(0);
}

console.log(`${pending.length} key(s) still Thai in en.json`);
if (!WRITE) {
  for (const key of pending.slice(0, 20)) console.log(`  · ${key}`);
  if (pending.length > 20) console.log(`  … and ${pending.length - 20} more`);
  console.log('\ndry run — pass --write to translate');
  process.exit(0);
}

const prompt = readFileSync(PROMPT_PATH, 'utf8');
const translated = {};
const failures = [];

for (let start = 0; start < pending.length; start += BATCH_SIZE) {
  const batch = pending.slice(start, start + BATCH_SIZE);
  const payload = Object.fromEntries(batch.map((key) => [key, flatTh[key] ?? flatEn[key]]));
  const label = `batch ${Math.floor(start / BATCH_SIZE) + 1}/${Math.ceil(pending.length / BATCH_SIZE)}`;
  process.stdout.write(`${label} — ${batch.length} keys … `);

  let raw;
  try {
    raw = execFileSync(
      'gemini',
      ['--skip-trust', '-p', `${prompt}\n\n${JSON.stringify(payload, null, 2)}`],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, cwd: ROOT },
    );
  } catch (error) {
    failures.push(`${label}: gemini failed — ${error.message.split('\n')[0]}`);
    console.log('gemini failed');
    continue;
  }

  // The CLI prints warnings (256-color, ripgrep) before the answer, so take the JSON object rather
  // than assuming the whole stdout is it.
  const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  let result;
  try {
    result = JSON.parse(json);
  } catch {
    failures.push(`${label}: reply was not JSON`);
    console.log('reply was not JSON');
    continue;
  }

  const problems = [];
  for (const key of batch) {
    const source = String(payload[key]);
    const value = result[key];
    if (typeof value !== 'string') {
      problems.push(`${key}: missing from the reply`);
      continue;
    }
    if (THAI.test(value)) problems.push(`${key}: still Thai`);
    if (BANNED.test(value)) problems.push(`${key}: forbidden claim — ${value.slice(0, 60)}`);
    const wanted = (source.match(PLACEHOLDERS) ?? []).sort().join(',');
    const got = (value.match(PLACEHOLDERS) ?? []).sort().join(',');
    if (wanted !== got) problems.push(`${key}: placeholders [${wanted}] → [${got}]`);
    const beforeNumbers = (source.match(NUMBERS) ?? []).sort().join(',');
    const afterNumbers = (value.match(NUMBERS) ?? []).sort().join(',');
    if (beforeNumbers !== afterNumbers) {
      problems.push(`${key}: numbers [${beforeNumbers}] → [${afterNumbers}]`);
    }
  }
  const extra = Object.keys(result).filter((key) => !batch.includes(key));
  if (extra.length > 0) problems.push(`invented keys: ${extra.join(', ')}`);

  if (problems.length > 0) {
    failures.push(`${label}:\n    ${problems.join('\n    ')}`);
    console.log(`rejected (${problems.length} problem(s))`);
    continue;
  }

  for (const key of batch) translated[key] = result[key];
  console.log('ok');
}

for (const [key, value] of Object.entries(translated)) setPath(en, key, value);
writeFileSync(EN_PATH, `${JSON.stringify(en, null, 2)}\n`);

console.log(`\nwrote ${Object.keys(translated).length}/${pending.length} key(s) into messages/en.json`);
if (failures.length > 0) {
  console.error(`\n${failures.length} batch(es) rejected — those keys are still Thai:`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
