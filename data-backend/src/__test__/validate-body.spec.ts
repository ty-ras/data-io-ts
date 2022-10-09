/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../validate-body";
import * as t from "io-ts";
import * as stream from "stream";

test("Validate inputValidator works", async (c) => {
  c.plan(4);
  const input = t.string;
  const { validator, validatorSpec } = spec.inputValidator(input);
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
});

test("Validate outputValidator works", (c) => {
  c.plan(3);
  const output = t.string;
  const { validator, validatorSpec } = spec.outputValidator(output);
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
