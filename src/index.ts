//backend/src/index.ts
//will add documentation
import express, { Express, RequestHandler } from "express";
import { verifyDafny, runDafny } from "./runDafny";
import { forwardSympy } from "./runSympy";
import { writeFileSync } from "fs";
import { exec } from "child_process";
import bodyParser from "body-parser";

const app: Express = express();
const port = 3000;

//cors options
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//log requester
const logRequest: RequestHandler = (req, res, next) => {
  next();
};

app.use(logRequest);
app.use(bodyParser.text({ type: "text/plain" }));

//sends dafny code to the verifier and returns result
app.post("/verify", (req, res) => {
  const dafnyCode: string = req.body.toString();
  verifyDafny(dafnyCode).then((result) => {
    res.send(result);
  });
});

//sends dafny code to runner and returns result
app.post("/run", (req, res) => {
  const dafnyCode: string = req.body.toString();
  runDafny(dafnyCode).then((result) => {
    res.send(result);
  });
});

//sends dafny code with the user-given hoare triple to the verifier and returns result
app.post("/hoare", (req, res) => {
  const dafnyCode: string = req.body.toString();
  verifyDafny(dafnyCode).then((result) => {
    res.send(result);
  });
});

//sends formatted input to sympy python runner and returns result
//also checks if user-input is of proper format. returns error if not
app.post("/forward", (req, res) => {
  const input: string = req.body as string;
  const match = input.match(/^\s*\{([^}]*)\}\s*([\s\S]*)$/);
  if (!match) {
    return res
      .status(400)
      .send("Invalid forward-reasoning format: expected '{precondition} statement;'\n"); //user syntax error
  }

  const [, pre, stmt] = match;
  forwardSympy(pre, stmt)
    .then((output) => res.send(output)) //expected output
    .catch((err) => {
      console.error("SymPy execution error:", err); //error output
      res.status(500).send(err.toString());
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});