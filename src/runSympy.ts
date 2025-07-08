// src/runSympy.ts
import { exec } from "child_process";
import path from "path";

export async function forwardSympy(pre: string, stmt: string): Promise<string> {
  // Choose the correct Python binary name per platform
  const pyBinName = process.platform === "win32" ? "python.exe" : "python";
  const pythonBinaryPath = path.join(__dirname, "sympy-python", pyBinName);
  // Python script location under sympy-python/python
  const scriptPath = path.join(__dirname, "Python-Files", "forward_sympy.py");
  const projectRoot = "./";

  return new Promise<string>((resolve, reject) => {
    const cmd = `"${pythonBinaryPath}" "${scriptPath}" "${pre}" "${stmt}"`;
    exec(cmd, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.error(`SymPy execution error: ${error}`);
        console.error(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        return reject(stderr || error.message);
      }
      const raw = stdout.trim();
      // Convert SymPy expression to Java boolean expression
      let javaExpr = raw
        // Eq(var, val) → (var == val)
        .replace(/Eq\(\s*([a-zA-Z_][\w]*)\s*,\s*([^\)]+)\)/g, '($1 == $2)')
        // & → &&
        .replace(/\s*&\s*/g, ' && ')
        // | → ||
        .replace(/\s*\|\s*/g, ' || ');

      // Remove redundant parentheses around individual comparisons
      javaExpr = javaExpr.replace(/\(\s*([^()]+?)\s*\)/g, '$1');

      // Wrap in Java-style braces
      const result = `{${javaExpr}}`;
      resolve(result);
    });
  });
}