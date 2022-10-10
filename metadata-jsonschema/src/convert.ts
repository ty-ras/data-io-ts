import type * as data from "@ty-ras/data-io-ts";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import * as common from "@ty-ras/metadata-jsonschema";
import type * as types from "./types";

export const validationToSchema = (
  validation: types.Encoder | types.Decoder,
  override: types.Override | undefined,
  fallbackValue: types.FallbackValue,
  topLevel: boolean,
): common.JSONSchema => {
  const recursion = (innerValidation: types.Encoder | types.Decoder) =>
    validationToSchema(innerValidation, override, fallbackValue, false);
  let retVal = override?.(validation);
  if (retVal === undefined) {
    if ("_tag" in validation) {
      const type = validation as AllTypes;
      const tag = type._tag;
      switch (tag) {
        case "NullType":
          {
            retVal = {
              type: "null",
            };
          }
          break;
        // case "UndefinedType":
        //   {
        //     retVal = undefined;
        //   }
        //   break;
        // case "VoidType":
        //   {
        //     retVal = undefined;
        //   }
        //   break;
        // case "UnknownType":
        //   {
        //     retVal = undefined;
        //   }
        //   break;
        case "StringType":
          {
            retVal = {
              type: "string",
            };
          }
          break;
        case "NumberType":
          {
            retVal = {
              type: "number",
            };
          }
          break;
        // case "BigIntType":
        //   {
        //     retVal = undefined;
        //   }
        //   break;
        case "BooleanType":
          {
            retVal = {
              type: "boolean",
            };
          }
          break;
        case "AnyArrayType":
          {
            retVal = {
              type: "array",
            };
          }
          break;
        case "AnyDictionaryType":
          {
            retVal = {
              type: "object",
            };
          }
          break;
        case "LiteralType": {
          retVal = {
            const: type.value,
          };
          break;
        }
        case "KeyofType":
          {
            const keys = Object.keys(type.keys);
            retVal =
              keys.length === 1
                ? {
                    const: keys[0],
                  }
                : keys.length > 1
                ? {
                    enum: keys,
                  }
                : undefined;
          }
          break;
        case "RefinementType":
        case "ReadonlyType":
        case "ReadonlyArrayType":
          {
            retVal = recursion(type.type);
          }
          break;
        // TODO: use ref here
        // case "RecursiveType":
        //   {
        //     retVal = recursion(type.type);
        //   }
        //   break;
        case "ArrayType":
          {
            retVal = {
              type: "array",
              items: recursion(type.type),
            };
          }
          break;
        case "InterfaceType":
          {
            const entries = Object.entries(type.props);
            retVal = {
              type: "object",
              properties: Object.fromEntries(
                entries.map(([propName, propValidation]) => [
                  propName,
                  recursion(propValidation),
                ]),
              ),
              required: entries.map(([propName]) => propName),
            };
          }
          break;
        case "PartialType":
          {
            retVal = {
              type: "object",
              properties: Object.fromEntries(
                Object.entries(type.props).map(([propName, propValidation]) => [
                  propName,
                  recursion(propValidation),
                ]),
              ),
            };
          }
          break;
        case "DictionaryType":
          {
            retVal = {
              type: "object",
              propertyNames: recursion(type.domain),
              additionalProperties: recursion(type.codomain),
            };
          }
          break;
        case "UnionType":
          {
            const components = Array.from(
              common.flattenDeepStructures(
                type.types as Array<AllTypes>,
                (subType) =>
                  subType._tag === "UnionType"
                    ? (subType.types as Array<AllTypes>)
                    : undefined,
              ),
            );
            if (topLevel) {
              const nonUndefineds = components.filter(
                (element) => element !== t.undefined,
              );
              if (nonUndefineds.length !== components.length) {
                // This is top-level optional schema -> just transform the underlying non-undefineds
                retVal =
                  nonUndefineds.length === 1
                    ? recursion(nonUndefineds[0])
                    : {
                        anyOf: nonUndefineds.map(recursion),
                      };
              }
            }
            if (retVal === undefined) {
              retVal = {
                anyOf: components.map(recursion),
              };
            }
            retVal = common.tryToCompressUnionOfMaybeEnums(retVal);
          }
          break;
        case "IntersectionType":
          {
            retVal = {
              allOf: type.types.map(recursion),
            };
          }
          break;
        case "TupleType":
          {
            retVal = {
              type: "array",
              minItems: type.types.length,
              maxItems: type.types.length,
              items: type.types.map(recursion),
            };
          }
          break;
        case "ExactType":
          {
            retVal = recursion(type.type);
            if (typeof retVal === "object" && retVal.type === "object") {
              retVal.minProperties = retVal.maxProperties = Object.keys(
                retVal.properties ?? {},
              ).length;
            }
          }
          break;
        // case "FunctionType":
        //   {
        //     retVal = undefined;
        //   }
        //   break;
        case "NeverType":
          {
            retVal = false;
          }
          break;
        case "AnyType":
          {
            retVal = true;
          }
          break;
        case "ObjectType":
          {
            retVal = {
              type: "object",
            };
          }
          break;
        case "StrictType":
          {
            retVal = undefined;
          }
          break;
        case "PipeTransform":
          {
            retVal = recursion(type.stringType);
            if (retVal && typeof retVal === "object") {
              retVal.description = type.name;
            }
          }
          break;
      }
      if (retVal && typeof retVal !== "boolean" && !retVal.description) {
        retVal.description = type.name;
      }
    } else {
      retVal = transformFromIOTypes(validation);
    }
  }
  return retVal ?? common.getFallbackValue(validation, fallbackValue);
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
  | data.Pipe<any, any>;

const transformFromIOTypes = common.transformerFromMany<
  unknown,
  common.JSONSchema
>([
  common.transformerFromEquality(tt.DateFromISOString, () => ({
    type: "string",
    // TODO pattern
    description: "Timestamp in ISO format.",
  })),
  // TODO add more here
]);
