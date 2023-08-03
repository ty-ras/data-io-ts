/**
 * @file This file contains unit tests for functionality in file `../headers.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../headers";
import * as t from "io-ts";

test("Validate headers works", (c) => {
  c.plan(5);
  const headerParamValue = t.string;
  const { validators, metadata } = spec.requestHeaders({
    headerParam: {
      required: true,
      decoder: headerParamValue,
    },
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
    errorInfo: 'Request header "headerParam" is mandatory.',
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
  const { validators, metadata } = spec.responseHeaders<{
    headerParam: string;
  }>({
    headerParam: {
      required: true,
      encoder: headerParamValue,
    },
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
    errorInfo: 'Response header "headerParam" is mandatory.',
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
  const { validators, metadata } = spec.requestHeaders<{
    requiredHeader: string;
    optionalHeader: string | undefined;
  }>({
    requiredHeader: { required: true, decoder: headerType },
    optionalHeader: { required: false, decoder: optionalHeaderType },
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
  const { validators, metadata } = spec.responseHeaders<{
    requiredHeader: string;
    optionalHeader: string | undefined;
  }>({
    requiredHeader: { required: true, encoder: headerType },
    optionalHeader: { required: false, encoder: optionalHeaderType },
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
