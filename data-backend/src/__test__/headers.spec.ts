/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../headers";
import * as t from "io-ts";

test("Validate headers works", (c) => {
  c.plan(5);
  const headerParamValue = t.string;
  const { validators, metadata } = spec.headers({
    headerParam: headerParamValue,
  });
  c.deepEqual(metadata, {
    headerParam: {
      required: true,
      decoder: headerParamValue,
    },
  });
  c.deepEqual(Object.keys(validators), ["headerParam"]);
  c.deepEqual(validators.headerParam("123"), { error: "none", data: "123" });
  c.like(validators.headerParam(undefined), {
    error: "error",
    errorInfo: 'Header "headerParam" is mandatory.',
  });
  c.like(validators.headerParam(123 as any), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            key: "",
            actual: 123,
            type: headerParamValue,
          },
        ],
        message: undefined,
        value: 123,
      },
    ],
  });
});

test("Validate responseHeaders works", (c) => {
  c.plan(5);
  const headerParamValue = t.string;
  const { validators, metadata } = spec.responseHeaders({
    headerParam: headerParamValue,
  });
  c.deepEqual(metadata, {
    headerParam: {
      required: true,
      encoder: headerParamValue,
    },
  });
  c.deepEqual(Object.keys(validators), ["headerParam"]);
  c.deepEqual(validators.headerParam("123"), { error: "none", data: "123" });
  c.like(validators.headerParam(undefined as any), {
    error: "error",
    errorInfo: 'Header "headerParam" is mandatory.',
  });
  c.like(validators.headerParam(123 as any), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            key: "",
            actual: 123,
            type: headerParamValue,
          },
        ],
        message: "Given value for input was not what the validator needed.",
        value: 123,
      },
    ],
  });
});

test("Validate string decoding optionality detection", (c) => {
  c.plan(3);
  const headerType = t.string;
  const optionalHeaderType = t.union([headerType, t.undefined]);
  const { validators, metadata } = spec.headers({
    requiredHeader: headerType,
    optionalHeader: optionalHeaderType,
  });
  c.deepEqual(metadata, {
    requiredHeader: {
      decoder: headerType,
      required: true,
    },
    optionalHeader: {
      decoder: optionalHeaderType,
      required: false,
    },
  });
  c.deepEqual(validators.optionalHeader(undefined), {
    error: "none",
    data: undefined,
  });
  c.like(validators.requiredHeader(undefined), {
    error: "error",
  });
});

test("Validate string encoding optionality detection", (c) => {
  c.plan(3);
  const headerType = t.string;
  const optionalHeaderType = t.union([headerType, t.undefined]);
  const { validators, metadata } = spec.responseHeaders({
    requiredHeader: headerType,
    optionalHeader: optionalHeaderType,
  });
  c.deepEqual(metadata, {
    requiredHeader: {
      encoder: headerType,
      required: true,
    },
    optionalHeader: {
      encoder: optionalHeaderType,
      required: false,
    },
  });
  c.deepEqual(validators.optionalHeader(undefined), {
    error: "none",
    data: undefined,
  });
  c.like(validators.requiredHeader(undefined as any), {
    error: "error",
  });
});
