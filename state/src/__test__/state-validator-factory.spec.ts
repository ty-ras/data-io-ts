/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/**
 * @file This file contains unit tests for functionality in file `../state-validator-factory.ts`.
 */

import test from "ava";
import * as spec from "../state-validator-factory";
import * as t from "io-ts";
import * as state from "@ty-ras/state";

test("Verify that state validator factory behaves as specified for authenticated properties", (c) => {
  c.plan(3);
  const stateValidatorFactory = createStateValidatorFactory(
    { userId: t.string },
    {},
  );

  const mandatory = stateValidatorFactory({ userId: true });

  c.deepEqual(mandatory.stateInfo, ["userId"]);
  c.deepEqual(mandatory.validator({ userId: "userId" }), {
    error: "none",
    data: { userId: "userId" },
  });
  c.like(mandatory.validator({ userId: 42 }), {
    // protocol-error and 401, because authentication-related property
    error: "protocol-error",
    statusCode: 401,
    body: undefined,
  });
});

test("Verify that state validator factory behaves as specified for non-authenticated properties", (c) => {
  c.plan(3);
  const stateValidatorFactory = createStateValidatorFactory(
    {},
    { otherProperty: t.string },
  );

  const mandatory = stateValidatorFactory({ otherProperty: true });

  c.deepEqual(mandatory.stateInfo, ["otherProperty"]);
  c.deepEqual(mandatory.validator({ otherProperty: "otherProperty" }), {
    error: "none",
    data: { otherProperty: "otherProperty" },
  });
  // For some reason, .like doesn't seem to be recursive, so... do it like this.
  c.like(mandatory.validator({ otherProperty: 42 }), {
    error: "error",
  });
});

test("Verify that giving wrong input to state validator factory throws an error", (c) => {
  c.plan(2);

  const stateValidatorFactory = createStateValidatorFactory(
    { userId: t.string },
    {},
  );

  c.throws(() => stateValidatorFactory({ notUserId: true } as any), {
    instanceOf: Error,
    message: 'The given key "notUserId" is not part of the state validation.',
  });
  c.throws(() => stateValidatorFactory({ userId: "somethingElse" } as any), {
    instanceOf: Error,
    message: 'The given key "userId" should contain boolean as value.',
  });
});

const createStateValidatorFactory = <
  TAuthenticated extends Record<string, t.Mixed>,
  TOther extends Record<string, t.Mixed>,
>(
  authenticated: TAuthenticated,
  other: TOther,
) =>
  spec.createStateValidatorFactory(
    state.getFullStateValidationInfo(authenticated, other),
  );
