/**
 * @file This file contains unit tests for functionality in file `../transform.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import test, { ExecutionContext } from "ava";
import * as spec from "../transform";
import type * as common from "@ty-ras/metadata-jsonschema";
import type * as data from "@ty-ras/data-io-ts";
// import * as data from "@ty-ras/data-io-ts";
import * as t from "io-ts";
import * as tt from "io-ts-types";

test("Validate transformToJSONSchema basic usages work", (c) => {
  c.plan(9);
  simpleTransformToJSONSchema(c, t.null, "null");
  simpleTransformToJSONSchema(c, t.undefined, "null", "undefined");
  simpleTransformToJSONSchema(c, t.void, "null", "void");
  simpleTransformToJSONSchema(c, t.string, "string");
  simpleTransformToJSONSchema(c, t.boolean, "boolean");
  simpleTransformToJSONSchema(c, t.number, "number");
  simpleTransformToJSONSchema(c, t.UnknownArray, "array", "UnknownArray");
  simpleTransformToJSONSchema(c, t.UnknownRecord, "object", "UnknownRecord");
  simpleTransformToJSONSchema(c, t.object, "object", "object");
});

test("Validate transformToJSONSchema complex non-hierarchical usages work", (c) => {
  c.plan(7);
  c.deepEqual(rawTransformToJSONSchema(t.literal("literal")), {
    type: "string",
    const: "literal",
    description: '"literal"',
  });
  c.deepEqual(rawTransformToJSONSchema(t.literal(true)), {
    type: "boolean",
    const: true,
    description: "true",
  });
  c.deepEqual(rawTransformToJSONSchema(t.keyof({ literal: true })), {
    type: "string",
    const: "literal",
    description: '"literal"',
  });
  c.deepEqual(rawTransformToJSONSchema(t.keyof({})), false);
  c.deepEqual(
    rawTransformToJSONSchema(t.keyof({ literal: true, anotherLiteral: true })),
    {
      type: "string",
      enum: ["literal", "anotherLiteral"],
      description: '"literal" | "anotherLiteral"',
    },
  );
  c.deepEqual(rawTransformToJSONSchema(t.never), false);
  c.deepEqual(rawTransformToJSONSchema(t.any), true);
});

test("Validate transformToJSONSchema simple hierarchical usages work", (c) => {
  c.plan(5);
  simpleTransformToJSONSchema(
    c,
    t.refinement(t.string, () => true),
    "string",
  );
  simpleTransformToJSONSchema(c, t.readonly(t.string), "string");
  const expectedArray: common.JSONSchema = {
    type: "array",
    items: {
      type: "string",
      description: "string",
    },
  };
  c.deepEqual(rawTransformToJSONSchema(t.array(t.string)), {
    ...expectedArray,
    description: "Array<string>",
  });
  c.deepEqual(rawTransformToJSONSchema(t.readonlyArray(t.string)), {
    ...expectedArray,
    description: "ReadonlyArray<string>",
  });
  c.deepEqual(
    rawTransformToJSONSchema(t.union([t.literal("one"), t.literal("two")])),
    {
      type: "string",
      enum: ["one", "two"],
      description: '("one" | "two")',
    },
  );
});

test("Validate transformToJSONSchema record types work", (c) => {
  c.plan(4);
  const expectedObject: common.JSONSchema = {
    type: "object",
    properties: {
      property: {
        type: "string",
        description: "string",
      },
    },
    description: "{ property: string }",
  };
  c.deepEqual(
    rawTransformToJSONSchema(
      t.type({
        property: t.string,
      }),
    ),
    {
      ...expectedObject,
      required: ["property"],
    },
  );
  c.deepEqual(
    rawTransformToJSONSchema(
      t.partial({
        property: t.string,
      }),
    ),
    {
      ...expectedObject,
      description: `Partial<${expectedObject.description}>`,
    },
  );
  c.deepEqual(rawTransformToJSONSchema(t.record(t.string, t.number)), {
    type: "object",
    propertyNames: {
      type: "string",
      description: "string",
    },
    additionalProperties: {
      type: "number",
      description: "number",
    },
    description: "{ [K in string]: number }",
  });
  c.deepEqual(
    rawTransformToJSONSchema(
      t.exact(
        t.type({
          property: t.string,
        }),
      ),
    ),
    {
      ...expectedObject,
      required: ["property"],
      minProperties: 1,
      maxProperties: 1,
    },
  );
});

test("Validate transformToJSONSchema complex hierarchical usages work", (c) => {
  c.plan(6);
  // Union
  const stringAndNumber: Array<common.JSONSchema> = [
    {
      type: "string",
      description: "string",
    },
    {
      type: "number",
      description: "number",
    },
  ];
  c.deepEqual(
    rawTransformToJSONSchema(t.union([t.string, t.undefined])),
    // Top level `| undefined` type gets cut out, as it is handled specially in OpenAPI plugin
    stringAndNumber[0],
  );
  c.deepEqual(
    rawTransformToJSONSchema(t.union([t.string, t.number, t.undefined])),
    {
      // Same thing happens here as above
      anyOf: stringAndNumber,
      // TODO do something about this...?
      description: "(string | number | undefined)",
    },
  );
  c.deepEqual(rawTransformToJSONSchema(t.union([t.string, t.number])), {
    // No undefined present -> both types must be present
    anyOf: stringAndNumber,
    description: "(string | number)",
  });

  // Intersection
  c.deepEqual(rawTransformToJSONSchema(t.intersection([t.string, t.number])), {
    allOf: stringAndNumber,
    description: "(string & number)",
  });

  // Tuple
  c.deepEqual(rawTransformToJSONSchema(t.tuple([t.string, t.number])), {
    type: "array",
    minItems: 2,
    maxItems: 2,
    items: stringAndNumber,
    description: "[string, number]",
  });

  // Heterogenous literal unions
  c.deepEqual(
    rawTransformToJSONSchema(t.union([t.literal("literal"), t.literal(1)])),
    {
      enum: ["literal", 1],
      description: '("literal" | 1)',
    },
  );
});

test("Validate transformToJSONSchema works for io-ts-types", (c) => {
  c.plan(1);
  c.deepEqual(rawTransformToJSONSchema(tt.DateFromISOString), {
    type: "string",
    description: "Timestamp in ISO format.",
  });
});

// test("Validate transformToJSONSchema works for pipe transform", (c) => {
//   c.plan(1);
//   c.deepEqual(
//     // A bit dummy Pipe but enough to serve our purposes
//     rawTransformToJSONSchema(
//       new data.Pipe<string, Date>(t.string, tt.DateFromISOString as any),
//     ),
//     {
//       type: "string",
//       // TODO think about this description...
//       description: "DateFromISOString",
//     },
//   );
// });

test("Validate that transformToJSONSchema works with override and/or fallback callbacks", (c) => {
  c.plan(3);
  const overrideValue: common.JSONSchema = true;
  c.deepEqual(
    spec.transformToJSONSchema(
      t.string,
      true,
      () => overrideValue,
      () => undefined,
    ),
    overrideValue,
  );
  const fallbackValue: common.JSONSchema = false;
  c.deepEqual(
    spec.transformToJSONSchema(t.unknown, true, undefined, () => fallbackValue),
    fallbackValue,
  );
  c.deepEqual(
    spec.transformToJSONSchema(
      t.string,
      true,
      () => overrideValue,
      fallbackValue,
    ),
    overrideValue,
  );
});

test("Validate that transformToJSONSchema works with union of unions", (c) => {
  c.plan(1);
  c.deepEqual(
    rawTransformToJSONSchema(
      t.union([t.string, t.union([t.number, t.boolean])]),
    ),
    {
      // Nested unions are flattened
      anyOf: [
        {
          description: "string",
          type: "string",
        },
        {
          description: "number",
          type: "number",
        },
        {
          description: "boolean",
          type: "boolean",
        },
      ],
      description: "(string | (number | boolean))",
    },
  );
});

const simpleTransformToJSONSchema = (
  c: ExecutionContext,
  validation: data.AnyDecoder | data.AnyEncoder,
  type: Exclude<common.JSONSchema, boolean>["type"],
  description?: string,
) =>
  c.deepEqual(rawTransformToJSONSchema(validation), {
    type,
    description: description ?? type,
  });

const rawTransformToJSONSchema = (
  validation: data.AnyDecoder | data.AnyEncoder,
) => spec.transformToJSONSchema(validation, true, undefined, () => undefined);
