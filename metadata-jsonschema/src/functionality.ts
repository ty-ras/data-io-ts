import * as common from "@ty-ras/metadata-jsonschema";
import * as t from "io-ts";
import type * as types from "./types";
import * as convert from "./convert";

export const createJsonSchemaFunctionality = <
  TTransformedSchema,
  TContentTypes extends string,
>({
  contentTypes,
  override,
  fallbackValue,
  ...args
}: Input<TTransformedSchema, TContentTypes>) =>
  common.createJsonSchemaFunctionality({
    ...args,
    stringDecoder: {
      transform: (decoder: types.Decoder) =>
        convert.validationToSchema(
          decoder,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
          true,
        ),
      override,
    },
    stringEncoder: {
      transform: (encoder: types.Encoder) =>
        convert.validationToSchema(
          encoder,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
          true,
        ),
      override,
    },
    encoders: common.arrayToRecord(
      contentTypes,
      (): common.SchemaTransformation<types.Encoder> => ({
        transform: (validation) =>
          convert.validationToSchema(
            validation,
            override,
            fallbackValue ?? common.getDefaultFallbackValue(),
            true,
          ),
        override,
      }),
    ),
    decoders: common.arrayToRecord(
      contentTypes,
      (): common.SchemaTransformation<types.Decoder> => ({
        transform: (validation) =>
          convert.validationToSchema(
            validation,
            override,
            fallbackValue ?? common.getDefaultFallbackValue(),
            true,
          ),
        override,
      }),
    ),
    getUndefinedPossibility,
  });

export type Input<
  TTransformedSchema,
  TContentTypes extends string,
> = common.JSONSchemaFunctionalityCreationArgumentsContentTypes<
  TTransformedSchema,
  TContentTypes,
  types.Encoder | types.Decoder
> & {
  override?: common.Override<types.Encoder | types.Decoder>;
};

const getUndefinedPossibility = (
  validation: types.Encoder | types.Decoder,
): common.UndefinedPossibility =>
  validation instanceof t.UndefinedType ||
  ((validation instanceof t.IntersectionType ||
    validation instanceof t.UnionType) &&
    (
      validation as t.IntersectionType<Array<t.Any>> | t.UnionType<Array<t.Any>>
    ).types.some(getUndefinedPossibility));
