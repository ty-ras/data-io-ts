/**
 * @file This file contains unit tests for functionality in file `../fp-ts-utils.ts`.
 */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../fp-ts-utils";
import * as t from "io-ts";
import { either as E } from "fp-ts";

test("Validate that toErrorClass works correctly", (c) => {
  c.plan(2);
  const errorObject = new Error();
  const iotsError: t.Errors = [];
  c.is(spec.toErrorClass(errorObject), errorObject);
  c.true(spec.toErrorClass(iotsError) instanceof Error);
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

test("Validate that getOrElseThrow works correctly", (c) => {
  c.plan(3);
  const error = new Error();
  const iotsError: t.Errors = [];
  c.throws(() => spec.getOrElseThrow(E.left(error)));
  c.throws(() => spec.getOrElseThrow(E.left(iotsError)));
  c.deepEqual(spec.getOrElseThrow(E.right("ok")), "ok");
});
