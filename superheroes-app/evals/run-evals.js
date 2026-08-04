'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILL_PATH = path.join(__dirname, '..', '.claude', 'skills', 'api-security-review', 'SKILL.md');
const TEST_CASES_PATH = path.join(__dirname, 'test-cases.json');

const skillInstructions = fs.readFileSync(SKILL_PATH, 'utf8');
const testCases = JSON.parse(fs.readFileSync(TEST_CASES_PATH, 'utf8'));

function runClaude(prompt, systemPrompt) {
  let cmd = `claude -p ${JSON.stringify(prompt)}`;
  if (systemPrompt) {
    cmd += ` --append-system-prompt ${JSON.stringify(systemPrompt)}`;
  }
  const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  return output.trim();
}

function getReview(diff) {
  const prompt =
    'The following is a git diff introducing changes to a Node.js/Express API backend. ' +
    'Perform a concise security review that surfaces every distinct security issue present in the diff. ' +
    'Be specific — cite the relevant code and explain the vulnerability.\n\n' +
    '```diff\n' + diff + '\n```';
  return runClaude(prompt, skillInstructions);
}

function gradeReview(review, criteria) {
  const criteriaList = criteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const prompt =
    'You are grading a security review against a set of criteria. ' +
    'For each criterion, determine whether the review satisfies it.\n\n' +
    '### Security Review\n\n' +
    review + '\n\n' +
    '### Criteria\n\n' +
    criteriaList + '\n\n' +
    'Return ONLY a JSON array — no prose, no markdown fences — one object per criterion in order:\n' +
    '[{"criterion": "<exact criterion text>", "result": "pass|fail"}]\n' +
    'Use exactly the strings "pass" or "fail" for the result field.';
  const raw = runClaude(prompt, null);
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not find JSON array in grader response:\n' + raw);
  }
  return JSON.parse(jsonMatch[0]);
}

function pad(str, len) {
  return String(str).padEnd(len, ' ');
}

const COL_ID = 30;
const COL_CRITERION = 62;
const COL_RESULT = 6;

const divider = '-'.repeat(COL_ID + COL_CRITERION + COL_RESULT + 6);

console.log('\n' + divider);
console.log(pad('TEST CASE', COL_ID) + '  ' + pad('CRITERION', COL_CRITERION) + '  ' + 'RESULT');
console.log(divider);

let anyFail = false;

for (const tc of testCases) {
  console.error(`\n[run-evals] Reviewing test case: ${tc.id} ...`);
  let review;
  try {
    review = getReview(tc.input);
  } catch (err) {
    console.error(`[run-evals] ERROR getting review for ${tc.id}:`, err.message);
    process.exit(1);
  }

  console.error(`[run-evals] Grading ${tc.criteria.length} criteria for: ${tc.id} ...`);
  let grades;
  try {
    grades = gradeReview(review, tc.criteria);
  } catch (err) {
    console.error(`[run-evals] ERROR grading ${tc.id}:`, err.message);
    process.exit(1);
  }

  for (const grade of grades) {
    const result = String(grade.result).toLowerCase();
    if (result === 'fail') anyFail = true;
    const criterionPreview = grade.criterion.length > COL_CRITERION
      ? grade.criterion.slice(0, COL_CRITERION - 1) + '…'
      : grade.criterion;
    console.log(
      pad(tc.id, COL_ID) + '  ' +
      pad(criterionPreview, COL_CRITERION) + '  ' +
      result.toUpperCase()
    );
  }
}

console.log(divider + '\n');

if (anyFail) {
  console.error('[run-evals] One or more criteria FAILED.');
  process.exit(1);
} else {
  console.log('[run-evals] All criteria passed.');
  process.exit(0);
}
