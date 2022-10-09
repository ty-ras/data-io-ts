/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../header-parameters";
import * as t from "io-ts";

test("Test that headersValidator works", (c) => {
  c.plan(5);
  const headerParamValue = t.string;
  const { validators, metadata } = spec.headersValidator({
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

test("Test that responseHeadersValidator works", (c) => {
  c.plan(5);
  const headerParamValue = t.string;
  const { validators, metadata } = spec.responseHeadersValidator({
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
