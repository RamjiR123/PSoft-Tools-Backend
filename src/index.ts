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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


const logRequest: RequestHandler = (req, res, next) => {
  next();
};

app.use(logRequest);

app.use(bodyParser.text({ type: "text/plain" }));

app.post("/verify", (req, res) => {
  const dafnyCode: string = req.body.toString();
  verifyDafny(dafnyCode).then((result) => {
    res.send(result);
  });
});

app.post("/run", (req, res) => {
  const dafnyCode: string = req.body.toString();
  runDafny(dafnyCode).then((result) => {
    res.send(result);
  });
});

app.post("/hoare", (req, res) => {
  const dafnyCode: string = req.body.toString();
  verifyDafny(dafnyCode).then((result) => {
    res.send(result);
  });
});

app.post("/forward", (req, res) => {
  const input: string = req.body as string;
  const match = input.match(/^\s*\{([^}]*)\}\s*([\s\S]*)$/);
  if (!match) {
    return res
      .status(400)
      .send("Invalid forward-reasoning format: expected '{precondition} statement;'\n");
  }

  const [, pre, stmt] = match;
  forwardSympy(pre, stmt)
    .then((output) => res.send(output))
    .catch((err) => {
      console.error("SymPy execution error:", err);
      res.status(500).send(err.toString());
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
