/**
 * @file This file contains unit tests for functionality in file `../utils.ts`.
 */

import test from "ava";
import * as spec from "../utils";
import * as t from "io-ts";
import { function as F } from "fp-ts";
import * as error from "../error";

test("Validate transformLibraryResultToModelResult works for successful case", (c) => {
  c.plan(1);
  c.deepEqual(
    F.pipe(123, t.number.decode, spec.transformLibraryResultToModelResult),
    {
      error: "none",
      data: 123,
    },
  );
});

test("Validate transformLibraryResultToModelResult works for invalid case", (c) => {
  c.plan(2);
  const errorInfo: error.ValidationError = [
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
  ];
  const result = F.pipe(
    "123",
    t.number.decode,
    spec.transformLibraryResultToModelResult,
  );
  if (result.error === "error") {
    // Like because functions are compared by-ref, and the function returned by transformLibraryResultToModelResult is private
    c.like(result, {
      error: "error",
      errorInfo,
    });
    c.deepEqual(
      result.getHumanReadableMessage(),
      error.getHumanReadableErrorMessage(errorInfo),
    );
  }
});
