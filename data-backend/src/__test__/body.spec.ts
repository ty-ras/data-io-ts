/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../body";
import * as t from "io-ts";
import * as stream from "stream";

test("Validate requestBody works", async (c) => {
  c.plan(5);
  const input = t.string;
  const { validator, validatorSpec } = spec.requestBody(input);
  c.deepEqual(validatorSpec, {
    contents: {
      [spec.CONTENT_TYPE]: input,
    },
  });
  const correctReadable = () => stream.Readable.from([JSON.stringify("123")]);
  c.deepEqual(
    await validator({
      contentType: spec.CONTENT_TYPE,
      input: correctReadable(),
    }),
    {
      error: "none",
      data: "123",
    },
  );
  c.deepEqual(
    await validator({
      contentType: "incorrect/applicationtype",
      input: correctReadable(),
    }),
    {
      error: "unsupported-content-type",
      supportedContentTypes: [spec.CONTENT_TYPE],
    },
  );
  c.like(
    await validator({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify(123)]),
    }),
    {
      error: "error",
      errorInfo: [
        {
          context: [
            {
              key: "",
              actual: 123,
              type: input,
            },
          ],
          message: undefined,
          value: 123,
        },
      ],
    },
  );
  c.like(
    await validator({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "error",
      errorInfo: [
        {
          context: [
            {
              key: "",
              actual: undefined,
              type: input,
            },
          ],
          message: undefined,
          value: undefined,
        },
      ],
    },
  );
});

test("Validate responseBody works", (c) => {
  c.plan(3);
  const output = t.string;
  const { validator, validatorSpec } = spec.responseBody(output);
  c.deepEqual(validatorSpec, {
    contents: {
      [spec.CONTENT_TYPE]: output,
    },
  });
  c.deepEqual(validator("123"), {
    error: "none",
    data: {
      contentType: spec.CONTENT_TYPE,
      output: JSON.stringify("123"),
    },
  });
  c.like(validator(123 as any), {
    error: "error",
    errorInfo: [
      {
        context: [
          {
            actual: 123,
            key: "",
            type: output,
          },
        ],
        message: "Given value for input was not what the validator needed.",
        value: 123,
      },
    ],
  });
});

test("Validate request body optionality works", async (c) => {
  c.plan(4);
  const { validator: forbidRequestBody } = spec.requestBody(t.undefined);
  c.deepEqual(
    await forbidRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "none",
      data: undefined,
    },
  );
  c.like(
    await forbidRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify("123")]),
    }),
    {
      error: "error",
    },
  );
  const { validator: optionalRequestBody } = spec.requestBody(
    t.union([t.undefined, t.string]),
  );
  c.deepEqual(
    await optionalRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "none",
      data: undefined,
    },
  );
  c.deepEqual(
    await optionalRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify("123")]),
    }),
    {
      error: "none",
      data: "123",
    },
  );
});

test("Validate request body detects invalid JSON", async (c) => {
  c.plan(2);
  const { validator } = spec.requestBody(t.string);
  const result = await validator({
    contentType: spec.CONTENT_TYPE,
    input: stream.Readable.from(["not-a-json"]),
  });
  c.like(result, {
    error: "error",
  });
  if (result.error === "error") {
    c.true(result.errorInfo instanceof SyntaxError);
  }
});

test("Validate response body detects invalid JSON", (c) => {
  c.plan(1);
  const recursiveValidator = t.recursion<Recursive>("Recursive", (self) =>
    t.type({ a: self }),
  );
  const { validator } = spec.responseBody(recursiveValidator);
  const recursive: Recursive = {} as any;
  recursive.a = recursive;
  // We would expect error to be JSON.stringify complaining about recursiveness.
  // However, the actual error is maximum call stack exceeded error, because of RecursiveType in io-ts naïvely checks for value in its `is` implementation.
  // That is enough tho for this case.
  c.like(validator(recursive), { error: "error" });
});

interface Recursive {
  a: Recursive;
}
