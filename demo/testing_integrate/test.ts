#!/usr/bin/env deno --allow-run --allow-net test.ts
import { run, RunOptions } from "deno";

const decoder = new TextDecoder();

const testUnitRunList = [
  {
    args: ["deno", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./../testing_unit",
    stdout: "piped"
  },
  {
    args: ["deno", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./../testing_progress",
    stdout: "piped"
  }
]

async function runUnitTest(opts: RunOptions): Promise<string> {
  const unitTest = run(opts);
  const outStream = await unitTest.output();
  const output = decoder.decode(outStream);
  return output
}

async function *runAllUnitTest(optsList): AsyncIterableIterator<any[]>{
  for (let i = 0; i < optsList.length; i++) {
    let err = null;
    let log = null;
    const opts: RunOptions = optsList[i];
    try {
      log = await runUnitTest(opts);
    } catch (e) {
      err = e;
    }
    yield [err, log];
  }
}

async function main() {
  for await(const [err, log] of runAllUnitTest(testUnitRunList)) {
    if (err) {
      throw new Error(err);
    } else {
      console.log(log);
    }
  }
}

main();
