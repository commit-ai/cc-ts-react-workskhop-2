#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let filePath, projectedContent;
  try {
    const event = JSON.parse(input);
    const toolInput = event.tool_input || {};
    filePath = toolInput.file_path || toolInput.path;

    if (!filePath) process.exit(0);

    const toolName = event.tool_name || "";

    if (toolName === "Write") {
      projectedContent = toolInput.content ?? null;
    } else if (toolName === "Edit") {
      const current = fs.readFileSync(path.resolve(filePath), "utf8");
      const oldStr = toolInput.old_string ?? "";
      const newStr = toolInput.new_string ?? "";
      const replaceAll = toolInput.replace_all === true;
      if (replaceAll) {
        projectedContent = current.split(oldStr).join(newStr);
      } else {
        const idx = current.indexOf(oldStr);
        projectedContent = idx === -1 ? current : current.slice(0, idx) + newStr + current.slice(idx + oldStr.length);
      }
    } else if (toolName === "MultiEdit") {
      let current = fs.readFileSync(path.resolve(filePath), "utf8");
      for (const edit of toolInput.edits || []) {
        const oldStr = edit.old_string ?? "";
        const newStr = edit.new_string ?? "";
        const replaceAll = edit.replace_all === true;
        if (replaceAll) {
          current = current.split(oldStr).join(newStr);
        } else {
          const idx = current.indexOf(oldStr);
          current = idx === -1 ? current : current.slice(0, idx) + newStr + current.slice(idx + oldStr.length);
        }
      }
      projectedContent = current;
    }
  } catch {
    process.exit(0);
  }

  if (!filePath || projectedContent == null) process.exit(0);

  const abs = path.resolve(filePath);
  const frontendSrc = path.resolve(__dirname, "../../../frontend/src");

  if (!abs.startsWith(frontendSrc + path.sep) && abs !== frontendSrc) {
    process.exit(0);
  }

  const ext = path.extname(abs);
  const frontendSrcDir = path.resolve(__dirname, "../../../frontend/src");
  const tmp = path.join(frontendSrcDir, `eslint-pre-edit-${Date.now()}${ext}`);
  fs.writeFileSync(tmp, projectedContent, "utf8");

  const eslint = path.resolve(__dirname, "../../../frontend/node_modules/.bin/eslint");

  try {
    const output = execSync(
      `"${eslint}" "${tmp}"`,
      { encoding: "utf8", cwd: path.resolve(__dirname, "../../../frontend") }
    );
    if (output) process.stdout.write(output);
  } catch (err) {
    if (err.stdout) process.stdout.write(err.stdout.replace(new RegExp(tmp, "g"), abs));
    if (err.stderr) process.stderr.write(err.stderr.replace(new RegExp(tmp, "g"), abs));
    process.exit(1);
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }

  process.exit(0);
});
