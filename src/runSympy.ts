import { exec } from "child_process";
import path from "path";

export async function forwardSympy(pre: string, stmt: string): Promise<string> {
  const pyBinName = process.platform === "win32" ? "python.exe" : "python"; //python.exe
  const pythonBinaryPath = path.join(__dirname, "sympy-python", pyBinName); //python.exe path
  const scriptPath = path.join(__dirname, "Python-Files", "forward_sympy.py"); //forward_sympy path
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
      //converting sympy expressions back into java expressions
      let javaExpr = raw
        //Eq(var, val) --> (var == val)
        .replace(/Eq\(\s*([a-zA-Z_][\w]*)\s*,\s*([^\)]+)\)/g, '($1 == $2)')
        //& --> &&
        .replace(/\s*&\s*/g, ' && ')
        //| --> ||
        .replace(/\s*\|\s*/g, ' || ');

      //get rid of parantheses (formatting)
      javaExpr = javaExpr.replace(/\(\s*([^()]+?)\s*\)/g, '$1');

      //wrap in braces like precondition (formatting)
      const result = `{${javaExpr}}`;
      resolve(result);
    });
  });
}