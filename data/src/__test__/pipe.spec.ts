/* eslint-disable sonarjs/no-duplicate-string */
import test from "ava";
import * as spec from "../pipe";
import * as t from "io-ts";
import * as pipe from "./pipe";

test("Validate IO-TS-based Pipe works", (c) => {
  c.plan(2);
  const piped = new spec.Pipe(t.string, pipe.stringToNumber);
  c.deepEqual(piped.decode("Not-a-number"), {
    _tag: "Left",
    left: [
      {
        context: [
          {
            actual: "Not-a-number",
            key: "",
            type: piped,
          },
        ],
        message: "Given value was not a string representing integer.",
        value: "Not-a-number",
      },
    ],
  });
  c.deepEqual(piped.decode("123"), {
    _tag: "Right",
    right: 123,
  });
});
