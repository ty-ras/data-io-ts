/**
 * @file This file contains unit tests for functionality in file `../fp-ts-utils.ts`.
 */

import test from "ava";
import * as spec from "../fp-ts-utils";

test("Validate that toEither works correctly", (c) => {
  c.plan(3);
  c.deepEqual(
    spec.toEither({
      error: "error",
      errorInfo: undefined,
      getHumanReadableMessage,
    }),
    {
      _tag: "Left",
      left: { error: "error", errorInfo: undefined, getHumanReadableMessage },
    },
  );
  c.deepEqual(spec.toEither({ error: "error-input", errorInfo: {} }), {
    _tag: "Left",
    left: { error: "error-input", errorInfo: {} },
  });
  c.deepEqual(spec.toEither({ error: "none", data: "data" }), {
    _tag: "Right",
    right: "data",
  });
});

const getHumanReadableMessage = () => "";
