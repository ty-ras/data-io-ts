/* eslint-disable sonarjs/no-duplicate-string */
import test from "ava";
import * as spec from "../error";
import * as t from "io-ts";
import * as f from "fp-ts";

test("Validate getHumanReadableErrorMessage works", (c) => {
  c.plan(1);
  c.deepEqual(
    f.function.pipe(
      "not-a-number",
      t.number.decode,
      f.either.mapLeft(spec.getHumanReadableErrorMessage),
    ),
    {
      _tag: "Left",
      left: 'Invalid value "not-a-number" supplied to : number',
    },
  );
});

test("Validate createErrorObject works", (c) => {
  c.plan(2);
  const result = f.function.pipe(
    "not-a-number",
    t.number.decode,
    f.either.mapLeft(spec.createErrorObject),
  );
  if (f.either.isLeft(result)) {
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
