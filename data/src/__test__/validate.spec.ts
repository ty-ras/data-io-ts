/**
 * @file This file contains unit tests for functionality in file `../validate.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../validate";
import * as t from "io-ts";
import * as pipe from "./pipe";

test("Validate plainValidator works", (c) => {
  c.plan(2);
  const validator = spec.fromDecoder(t.number);
  c.deepEqual(validator(123), {
    error: "none",
    data: 123,
  });
  c.like(validator("123"), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            actual: "123",
            key: "",
            type: t.number,
          },
        ],
        message: undefined,
        value: "123",
      },
    ],
  });
});

test("Validate plainValidatorEncoder works for unvalidated data", (c) => {
  c.plan(2);
  const encoder = spec.fromEncoder(pipe.stringToNumber);
  c.deepEqual(encoder(123), {
    error: "none",
    data: "123",
  });
  c.like(encoder("123" as any), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            actual: "123",
            key: "",
            type: pipe.stringToNumber,
          },
        ],
        message: "Given value for input was not what the validator needed.",
        value: "123",
      },
    ],
  });
});
