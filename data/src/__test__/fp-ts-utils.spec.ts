/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../fp-ts-utils";
import * as t from "io-ts";
import { either as E } from "fp-ts";

test("Validate that toError works correctly", (c) => {
  c.plan(2);
  const errorObject = new Error();
  const iotsError: t.Errors = [];
  c.is(spec.toError(errorObject), errorObject);
  c.true(spec.toError(iotsError) instanceof Error);
});

test("Validate that throwIfError works correctly", (c) => {
  c.plan(2);
  const error = new Error();
  c.throws(() => spec.throwIfError(error), { is: error });
  c.notThrows(() => spec.throwIfError("Hello"));
});

test("Validate that throwOnError works correctly", (c) => {
  c.plan(2);
  const error = new Error();
  const notError = "StillWillGetThrown";
  c.throws(() => spec.throwOnError(error), { is: error });
  // c.throws requires that thrown object is error, so for this one, we have to try-catch ourselves
  // If we don't catch, the planned assertion count will not match and test will fail
  try {
    spec.throwOnError(notError as any);
  } catch (e) {
    c.deepEqual(e, notError);
  }
});

test("Validate that validateFromMaybeStringifiedJSON works correctly", (c) => {
  c.plan(2);
  let seenValue: unknown;
  const error = new Error();
  const willAlwaysFail = spec.validateFromMaybeStringifiedJSON(
    t.void,
    (nonStringValue) => ((seenValue = nonStringValue), error),
  );
  c.deepEqual(willAlwaysFail(123), { _tag: "Left", left: error });
  c.deepEqual(seenValue, 123);
});

test("Validate that validateFromStringifiedJSON works correctly", (c) => {
  c.plan(2);
  const willAlwaysFail = spec.validateFromStringifiedJSON(t.void);
  c.deepEqual(willAlwaysFail("{}"), {
    _tag: "Left",
    left: [
      {
        context: [
          {
            key: "",
            actual: {},
            type: t.void,
          },
        ],
        value: {},
        message: undefined,
      },
    ],
  });
  const realistic = spec.validateFromStringifiedJSON(
    t.type({ property: t.string }),
  );
  c.deepEqual(realistic('{"property": "hello"}'), {
    _tag: "Right",
    right: {
      property: "hello",
    },
  });
});

test("Validate that getOrElseThrow works correctly", (c) => {
  c.plan(3);
  const error = new Error();
  const iotsError: t.Errors = [];
  c.throws(() => spec.getOrElseThrow(E.left(error)));
  c.throws(() => spec.getOrElseThrow(E.left(iotsError)));
  c.deepEqual(spec.getOrElseThrow(E.right("ok")), "ok");
});

test("Validate that readJSONStringToValueOrThrow works correctly", (c) => {
  c.plan(5);
  const ifNotString = new Error();
  const validator = spec.readJSONStringToValueOrThrow(
    t.string,
    () => ifNotString,
  );
  // When not non-empty string, custom callback gets invoked
  c.throws(() => validator(12), { is: ifNotString });
  c.throws(() => validator(""), { is: ifNotString });
  // If string but not parseable to JSON, the JSON.parse will throw
  c.throws(() => validator("  "), { instanceOf: Error });
  // When JSON string but doesn't pass validation, IO-TS error is thrown
  c.throws(() => validator("123"), { instanceOf: Error });
  // Otherwise, is success
  c.deepEqual(validator('"hello"'), "hello");
});
