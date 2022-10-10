import type * as data from "@ty-ras/data-io-ts";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import * as common from "@ty-ras/metadata-jsonschema";
import type * as types from "./types";

export const transformToJSONSchema = (
  validation: types.Encoder | types.Decoder,
  override: types.Override | undefined,
  fallbackValue: types.FallbackValue,
): common.JSONSchema =>
  transformToJSONSchemaImpl(true, validation, override, fallbackValue);

export const transformToJSONSchemaImpl = (
  topLevel: boolean,
  ...[validation, override, fallbackValue]: Parameters<
    typeof transformToJSONSchema
  >
): common.JSONSchema => {
  const recursion = (innerValidation: types.Encoder | types.Decoder) =>
    transformToJSONSchemaImpl(false, innerValidation, override, fallbackValue);
  let retVal = override?.(validation);
  if (retVal === undefined) {
    if ("_tag" in validation) {
      const allTypes = validation as AllTypes;
      retVal = transformTagged(recursion, allTypes, topLevel);
      if (retVal && typeof retVal !== "boolean" && !retVal.description) {
        retVal.description = allTypes.name;
      }
    } else {
      retVal = transformFromIOTypes(validation);
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
      return {
        const: type.value,
      };
    case "KeyofType":
      return compactConsts(type.keys);
    case "RefinementType":
    case "ReadonlyType":
    case "ReadonlyArrayType":
      return recursion(type.type);
    // TODO: use ref here
    // case "RecursiveType":
    //   {
    //     retVal = recursion(type.type);
    //   }
    //   break;
    case "ArrayType":
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
        retVal = {
          anyOf: components.map(recursion),
        };
      }
      return common.tryToCompressUnionOfMaybeEnums(retVal);
    }
    case "IntersectionType":
      return {
        allOf: type.types.map(recursion),
      };
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
    case "PipeTransform": {
      const retVal = recursion(type.stringType);
      if (retVal && typeof retVal === "object") {
        retVal.description = type.name;
      }
      return retVal;
    }
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
  | t.StrictType<t.Any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | data.Pipe<any, any>;

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

const compactConsts = (
  keysObject: Record<string, unknown>,
): JSONSchemaObject | undefined => {
  const keys = Object.keys(keysObject);
  return keys.length === 1
    ? {
        const: keys[0],
      }
    : keys.length > 1
    ? {
        enum: keys,
      }
    : undefined;
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
      : {
          anyOf: nonUndefineds.map(recursion),
        }
    : undefined;
};

type Recursion = (item: types.Encoder | types.Decoder) => common.JSONSchema;
