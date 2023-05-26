/**
 * @file This file contains code related to transforming `io-ts` validators to JSON schema objects.
 */

import { function as F, readonlyArray as RA, eq as EQ } from "fp-ts";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import * as common from "@ty-ras/metadata-jsonschema";
import type * as types from "./md.types";

/**
 * This function will transform the given {@link types.AnyDecoder} or {@link types.AnyDecoder} into {@link common.JSONSchema} value.
 * @param validation The `io-ts` decoder or encoder.
 * @param cutOffTopLevelUndefined When traversing validators hierarchically, set to `true` to consider top-level `X | undefined` value as just `X`.
 * @param override The optional callback to override certain decoders or encoders.
 * @param fallbackValue The callback to get fallback value when this transformation fails to construct the {@link common.JSONSchema} value.
 * @returns The {@link common.JSONSchema}
 */
export const transformToJSONSchema = (
  validation: types.AnyEncoder | types.AnyDecoder,
  cutOffTopLevelUndefined: boolean,
  override: types.Override | undefined,
  fallbackValue: types.FallbackValue,
): common.JSONSchema => {
  const recursion: Recursion = (
    innerValidation: types.AnyEncoder | types.AnyDecoder,
  ) =>
    transformToJSONSchemaImpl(
      false,
      recursion,
      innerValidation,
      cutOffTopLevelUndefined,
      override,
      fallbackValue,
    );

  return transformToJSONSchemaImpl(
    true,
    recursion,
    validation,
    cutOffTopLevelUndefined,
    override,
    fallbackValue,
  );
};

const transformToJSONSchemaImpl = (
  topLevel: boolean,
  recursion: Recursion,
  ...[validation, cutOffTopLevelUndefined, override, fallbackValue]: Parameters<
    typeof transformToJSONSchema
  >
): common.JSONSchema => {
  let retVal = override?.(validation, cutOffTopLevelUndefined);
  if (retVal === undefined) {
    if ("_tag" in validation) {
      const allTypes = validation as AllTypes;
      retVal = transformTagged(recursion, allTypes, topLevel);
      if (retVal && typeof retVal !== "boolean" && !retVal.description) {
        const name = allTypes.name;
        if (name !== undefined) {
          retVal.description = name;
        }
      }
    } else {
      retVal = transformFromIOTypes(validation, cutOffTopLevelUndefined);
    }
  }
  return retVal ?? common.getFallbackValue(validation, fallbackValue);
};

const transformTagged = (
  recursion: Recursion,
  type: AllTypes,
  topLevel: boolean,
): common.JSONSchema | undefined => {
  switch (type._tag) {
    case "NullType":
    case "UndefinedType":
    case "VoidType":
      return makeTypedSchema("null");
    // case "UnknownType":
    //   {
    //     retVal = undefined;
    //   }
    //   break;
    case "StringType":
      return makeTypedSchema("string");
    case "NumberType":
      return makeTypedSchema("number");
    // case "BigIntType":
    //   {
    //     retVal = undefined;
    //   }
    //   break;
    case "BooleanType":
      return makeTypedSchema("boolean");
    case "AnyArrayType":
      return makeTypedSchema("array");
    case "AnyDictionaryType":
      return makeTypedSchema("object");
    case "LiteralType":
      return transformLiteral(type.value);
    case "KeyofType":
      return transformKeyOf(type.keys);
    case "RefinementType":
    case "ReadonlyType":
      return recursion(type.type);
    // TODO: use ref here
    // case "RecursiveType":
    //   {
    //     retVal = recursion(type.type);
    //   }
    //   break;
    case "ArrayType":
    case "ReadonlyArrayType":
      return makeTypedSchema("array", {
        items: recursion(type.type),
      });
    case "InterfaceType":
      return makeObjectWithPropertiesSchema(recursion, type.props, false);
    case "PartialType":
      return makeObjectWithPropertiesSchema(recursion, type.props, true);
    case "DictionaryType":
      return makeTypedSchema("object", {
        propertyNames: recursion(type.domain),
        additionalProperties: recursion(type.codomain),
      });
    case "UnionType": {
      const components = Array.from(
        common.flattenDeepStructures(type.types as Array<AllTypes>, (subType) =>
          subType._tag === "UnionType"
            ? (subType.types as Array<AllTypes>)
            : undefined,
        ),
      );
      let retVal: common.JSONSchema | undefined;
      if (topLevel) {
        retVal = tryTransformTopLevelSchema(recursion, components);
      }
      if (retVal === undefined) {
        retVal = tryGetCommonTypeName("anyOf", components.map(recursion));
      }
      return common.tryToCompressUnionOfMaybeEnums(retVal);
    }
    case "IntersectionType":
      // TODO: optimize intersection of type + partial into one definition
      // TODO: we probably need to call flattenDeepStructures here too?
      return tryGetCommonTypeName("allOf", type.types.map(recursion));
    case "TupleType":
      return makeTypedSchema("array", {
        minItems: type.types.length,
        maxItems: type.types.length,
        items: type.types.map(recursion),
      });
    case "ExactType": {
      const retVal = recursion(type.type);
      if (typeof retVal === "object" && retVal.type === "object") {
        retVal.minProperties = retVal.maxProperties = Object.keys(
          retVal.properties ?? {},
        ).length;
      }
      return retVal;
    }
    // case "FunctionType":
    //   {
    //     retVal = undefined;
    //   }
    //   break;
    case "NeverType":
      return false;
    case "AnyType":
      return true;
    case "ObjectType":
      return makeTypedSchema("object");
  }
};

type AllTypes =
  | t.NullType
  | t.UndefinedType
  | t.VoidType
  | t.UnknownType
  | t.StringType
  | t.NumberType
  | t.BigIntType
  | t.BooleanType
  | t.AnyArrayType
  | t.AnyDictionaryType
  | t.LiteralType<string | number | boolean>
  | t.KeyofType<Record<string, unknown>>
  | t.RefinementType<t.Any>
  | t.RecursiveType<t.Any>
  | t.ArrayType<t.Any>
  | t.InterfaceType<Record<string, t.Any>>
  | t.PartialType<Record<string, t.Any>>
  | t.DictionaryType<t.Any, t.Any>
  | t.UnionType<Array<t.Any>>
  | t.IntersectionType<Array<t.Any>>
  | t.TupleType<Array<t.Any>>
  | t.ReadonlyType<t.Any>
  | t.ReadonlyArrayType<t.Any>
  | t.ExactType<t.Any>
  | t.FunctionType
  | t.NeverType
  | t.AnyType
  | t.ObjectType
  | t.StrictType<t.Any>;

const transformFromIOTypes = common.transformerFromMany<
  unknown,
  common.JSONSchema
>([
  common.transformerFromEquality(tt.DateFromISOString, () =>
    makeTypedSchema("string", {
      // TODO pattern
      description: "Timestamp in ISO format.",
    }),
  ),
  // TODO add more here
]);

type JSONSchemaObject = Exclude<common.JSONSchema, boolean>;

const makeTypedSchema = (
  type: JSONSchemaObject["type"],
  rest: Omit<JSONSchemaObject, "type"> = {},
): JSONSchemaObject => ({
  type,
  ...rest,
});

const makeObjectWithPropertiesSchema = (
  recursion: Recursion,
  properties: Record<string, t.Any>,
  propertiesAreOptional: boolean,
): JSONSchemaObject => {
  const entries = Object.entries(properties);
  const retVal = makeTypedSchema("object", {
    properties: Object.fromEntries(
      entries.map(([propName, propValidation]) => [
        propName,
        recursion(propValidation),
      ]),
    ),
  });
  if (!propertiesAreOptional) {
    retVal.required = entries.map(([propName]) => propName);
  }
  return retVal;
};

const tryTransformTopLevelSchema = (
  recursion: Recursion,
  components: ReadonlyArray<AllTypes>,
) => {
  // TODO should we use the same undefined check as in functionality.ts?
  // This one is kinda safe, as this is how undefinedness is implemented in data-backend library, but still, might be good to use same check everywhere?
  const nonUndefineds = components.filter((element) => element !== t.undefined);
  return nonUndefineds.length !== components.length
    ? // This is top-level optional schema -> just transform the underlying non-undefineds
      nonUndefineds.length === 1
      ? recursion(nonUndefineds[0])
      : tryGetCommonTypeName("anyOf", nonUndefineds.map(recursion))
    : undefined;
};

type Recursion = (
  item: types.AnyEncoder | types.AnyDecoder,
) => common.JSONSchema;

const transformKeyOf = (
  keysObject: Record<string, unknown>,
): common.JSONSchema | undefined => {
  const keys = Object.keys(keysObject);
  return keys.length <= 0
    ? false
    : makeTypedSchema(
        "string",
        keys.length === 1
          ? {
              const: keys[0],
            }
          : {
              enum: keys,
            },
      );
};

const transformLiteral = (value: string | number | boolean) =>
  makeTypedSchema(
    typeof value === "string"
      ? "string"
      : typeof value === "number"
      ? "number"
      : "boolean",
    {
      const: value,
    },
  );

const tryGetCommonTypeName = <TName extends "anyOf" | "allOf">(
  name: TName,
  schemas: ReadonlyArray<common.JSONSchema>,
): JSONSchemaObject => {
  const types = F.pipe(
    schemas,
    RA.map((s) =>
      typeof s === "object" && typeof s.type === "string" ? s.type : undefined,
    ),
    RA.uniq(EQ.fromEquals((x, y) => x === y)),
  );
  const retVal: JSONSchemaObject = { [name]: schemas };
  if (types.length === 1 && types[0] !== undefined) {
    retVal.type = types[0];
  }
  return retVal;
};
