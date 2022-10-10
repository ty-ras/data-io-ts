import test, { ExecutionContext } from "ava";
import * as spec from "../transform";
import type * as types from "../types";
import type * as common from "@ty-ras/metadata-jsonschema";
import * as t from "io-ts";

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
  c.plan(5);
  c.deepEqual(rawTransformToJSONSchema(t.literal("literal")), {
    const: "literal",
    description: '"literal"',
  });
  c.deepEqual(rawTransformToJSONSchema(t.keyof({ literal: true })), {
    const: "literal",
    description: '"literal"',
  });
  c.deepEqual(
    rawTransformToJSONSchema(t.keyof({ literal: true, anotherLiteral: true })),
    {
      enum: ["literal", "anotherLiteral"],
      description: '"literal" | "anotherLiteral"',
    },
  );
  c.deepEqual(rawTransformToJSONSchema(t.never), false);
  c.deepEqual(rawTransformToJSONSchema(t.any), true);
});

const simpleTransformToJSONSchema = (
  c: ExecutionContext,
  validation: types.Decoder | types.Encoder,
  type: Exclude<common.JSONSchema, boolean>["type"],
  description?: string,
) =>
  c.deepEqual(rawTransformToJSONSchema(validation), {
    type,
    description: description ?? type,
  });

const rawTransformToJSONSchema = (validation: types.Decoder | types.Encoder) =>
  spec.transformToJSONSchema(validation, undefined, () => undefined);
