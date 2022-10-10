import * as common from "@ty-ras/metadata-jsonschema";
import * as t from "io-ts";
import type * as types from "./types";
import * as convert from "./transform";

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
        convert.transformToJSONSchema(
          decoder,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
        ),
      override,
    },
    stringEncoder: {
      transform: (encoder: types.Encoder) =>
        convert.transformToJSONSchema(
          encoder,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
        ),
      override,
    },
    encoders: common.arrayToRecord(
      contentTypes,
      (): common.SchemaTransformation<types.Encoder> => ({
        transform: (validation) =>
          convert.transformToJSONSchema(
            validation,
            override,
            fallbackValue ?? common.getDefaultFallbackValue(),
          ),
        override,
      }),
    ),
    decoders: common.arrayToRecord(
      contentTypes,
      (): common.SchemaTransformation<types.Decoder> => ({
        transform: (validation) =>
          convert.transformToJSONSchema(
            validation,
            override,
            fallbackValue ?? common.getDefaultFallbackValue(),
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
  validation instanceof t.Type && validation.is(undefined);
