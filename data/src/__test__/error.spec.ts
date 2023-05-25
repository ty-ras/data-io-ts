/**
 * @file This file contains unit tests for functionality in file `../error.ts`.
 */

/* eslint-disable sonarjs/no-duplicate-string */
import test from "ava";
import * as spec from "../error";
import * as t from "io-ts";
import { function as F, either as E } from "fp-ts";

test("Validate getHumanReadableErrorMessage works", (c) => {
  c.plan(1);
  c.deepEqual(
    F.pipe(
      "not-a-number",
      t.number.decode,
      E.mapLeft(spec.getHumanReadableErrorMessage),
    ),
    {
      _tag: "Left",
      left: 'Invalid value "not-a-number" supplied to : number',
    },
  );
});

test("Validate createErrorObject works", (c) => {
  c.plan(2);
  const result = F.pipe(
    "not-a-number",
    t.number.decode,
    E.mapLeft(spec.createErrorObject),
  );
  if (E.isLeft(result)) {
    // Like because functions are compared by-ref, and the function returned by createErrorObject is private
    const errorInfo: spec.ValidationError = [
      {
        context: [
          {
            actual: "not-a-number",
            key: "",
            type: t.number,
          },
        ],
        message: undefined,
        value: "not-a-number",
      },
    ];
    c.like(result, {
      _tag: "Left",
      left: {
        error: "error",
        errorInfo,
      },
    });
    c.deepEqual(
      result.left.getHumanReadableMessage(),
      spec.getHumanReadableErrorMessage(errorInfo),
    );
  }
});
