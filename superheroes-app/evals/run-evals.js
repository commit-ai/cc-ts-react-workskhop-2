#!/usr/bin/env node

'use strict';

const { execFile } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { promisify } = require('node:util');
const { join } = require('node:path');

const execFileAsync = promisify(execFile);

const testCases = JSON.parse(
  readFileSync(join(__dirname, 'test-cases.json'), 'utf8')
);

const REVIEW_SYSTEM = `You are a senior software engineer performing code reviews.
Given a git diff, write a concise review covering ALL issues you find — correctness, safety, potential runtime errors, and configuration concerns. Be specific about line-level issues. Do not stop after the first finding; surface every distinct problem in the diff.`;

const JUDGE_SYSTEM = `You are an evaluation judge. You will be given a code review and a list of criteria.
For each criterion, decide whether the review satisfies it ("pass") or does not ("fail").
Respond with a JSON array only — no markdown fences, no explanation outside the array.
Each element must have exactly two keys: "criterion" (the criterion text verbatim) and "result" ("pass" or "fail").`;

async function callClaude(systemPrompt, userPrompt) {
  const { stdout } = await execFileAsync('claude', [
    '-p', userPrompt,
    '--append-system-prompt', systemPrompt,
    '--output-format', 'text',
  ]);
  return stdout.trim();
}

function parseJudgeOutput(raw) {
  const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();
  return JSON.parse(cleaned);
}

function pad(str, len) {
  return String(str).padEnd(len);
}

async function runTestCase(tc) {
  process.stderr.write(`  Running reviewer for "${tc.id}"...\n`);
  const review = await callClaude(REVIEW_SYSTEM, `Review this diff:\n\n${tc.input}`);

  process.stderr.write(`  Running judge for "${tc.id}"...\n`);
  const judgePrompt =
    `Code review:\n${review}\n\n` +
    `Criteria:\n${tc.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
  const judgeRaw = await callClaude(JUDGE_SYSTEM, judgePrompt);

  let judgements;
  try {
    judgements = parseJudgeOutput(judgeRaw);
  } catch {
    throw new Error(`Judge returned non-JSON for "${tc.id}":\n${judgeRaw}`);
  }

  return { id: tc.id, judgements };
}

async function main() {
  const results = [];

  for (const tc of testCases) {
    try {
      results.push(await runTestCase(tc));
    } catch (err) {
      process.stderr.write(`ERROR in "${tc.id}": ${err.message}\n`);
      process.exit(1);
    }
  }

  const COL_ID = 32;
  const COL_CRITERION = 70;
  const divider = `${'─'.repeat(COL_ID + COL_CRITERION + 12)}`;

  console.log('\n' + divider);
  console.log(`${pad('TEST CASE ID', COL_ID)}  ${pad('CRITERION', COL_CRITERION)}  RESULT`);
  console.log(divider);

  let anyFail = false;

  for (const { id, judgements } of results) {
    for (const { criterion, result } of judgements) {
      const icon = result === 'pass' ? '✓' : '✗';
      const label = result === 'pass' ? 'PASS' : 'FAIL';
      if (result !== 'pass') anyFail = true;

      const words = criterion.split(' ');
      const lines = [];
      let line = '';
      for (const word of words) {
        if ((line + ' ' + word).trim().length > COL_CRITERION) {
          lines.push(line.trim());
          line = word;
        } else {
          line = (line + ' ' + word).trim();
        }
      }
      if (line) lines.push(line);

      console.log(
        `${pad(id, COL_ID)}  ${pad(lines[0] ?? '', COL_CRITERION)}  ${icon} ${label}`
      );
      for (let i = 1; i < lines.length; i++) {
        console.log(`${pad('', COL_ID)}  ${pad(lines[i], COL_CRITERION)}`);
      }
    }
    console.log(divider);
  }

  const all = results.flatMap(r => r.judgements);
  const passed = all.filter(j => j.result === 'pass').length;
  console.log(`\nResult: ${passed}/${all.length} criteria passed\n`);

  process.exit(anyFail ? 1 : 0);
}

main();
