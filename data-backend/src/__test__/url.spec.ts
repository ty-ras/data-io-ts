/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../url";
import * as t from "io-ts";
import * as dataBE from "@ty-ras/data-backend";

test("Validate query works", (c) => {
  c.plan(5);
  const queryParamValue = t.string;
  const { validators, metadata } = spec.query({
    queryParam: queryParamValue,
  });
  c.deepEqual(metadata, {
    queryParam: {
      required: true,
      decoder: queryParamValue,
    },
  });
  c.deepEqual(Object.keys(validators), ["queryParam"]);
  c.deepEqual(validators.queryParam("123"), { error: "none", data: "123" });
  c.like(validators.queryParam(undefined), {
    error: "error",
    errorInfo: 'Query parameter "queryParam" is mandatory.',
  });
  c.like(validators.queryParam(123 as any), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            key: "",
            actual: 123,
            type: queryParamValue,
          },
        ],
        message: undefined,
        value: 123,
      },
    ],
  });
});

test("Validate url works", (c) => {
  c.plan(7);
  const urlParamDefaultRegExp = t.string;
  const numberRegExp = /\d+/;
  const urlParamCustomRegExp = t.refinement(t.string, (str) =>
    numberRegExp.test(str),
  );
  const { validators, metadata } = spec.url({
    urlParamDefaultRegExp: urlParamDefaultRegExp,
    urlParamCustomRegExp: {
      decoder: urlParamCustomRegExp,
      regExp: numberRegExp,
    },
  });
  c.deepEqual(metadata, {
    urlParamDefaultRegExp: {
      regExp: dataBE.defaultParameterRegExp(),
      decoder: urlParamDefaultRegExp,
    },
    urlParamCustomRegExp: {
      regExp: numberRegExp,
      decoder: urlParamCustomRegExp,
    },
  });
  c.deepEqual(Object.keys(validators), [
    "urlParamDefaultRegExp",
    "urlParamCustomRegExp",
  ]);
  const notANumber = "not-a-number";
  c.deepEqual(validators.urlParamDefaultRegExp(notANumber), {
    error: "none",
    data: notANumber,
  });
  c.like(validators.urlParamCustomRegExp(notANumber), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            actual: notANumber,
            key: "",
            type: urlParamCustomRegExp,
          },
        ],
        message: undefined,
        value: notANumber,
      },
    ],
  });
  c.deepEqual(validators.urlParamCustomRegExp("123"), {
    error: "none",
    data: "123",
  });
  c.like(validators.urlParamDefaultRegExp(123 as any), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            actual: 123,
            key: "",
            type: urlParamDefaultRegExp,
          },
        ],
        message: undefined,
        value: 123,
      },
    ],
  });
  c.like(validators.urlParamCustomRegExp(123 as any), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            actual: 123,
            key: "",
            type: urlParamCustomRegExp,
          },
        ],
        message: undefined,
        value: 123,
      },
    ],
  });
});
