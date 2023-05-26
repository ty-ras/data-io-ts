/**
 * @file This file contains function to invoke {@link common.createJsonSchemaFunctionalityGeneric} using `io-ts` lib-specific functionality (and leaving the rest to be specified as parameters.).
 */

import * as common from "@ty-ras/metadata-jsonschema";
import * as t from "io-ts";
import type * as types from "./md.types";
import * as convert from "./transform";

/**
 * Creates new {@link JSONSchemaFunctionality} from given {@link Input}.
 * This function is typically meant to be used by other TyRAS libraries, and rarely directly by client code.
 * @param param0 The {@link Input} to this function.
 * @param param0.contentTypes Privately deconstructed variable.
 * @param param0.override Privately deconstructed variable.
 * @param param0.fallbackValue Privately deconstructed variable.
 * @returns The {@link JSONSchemaFunctionality} that can be used when creating metadata providers.
 */
export const createJsonSchemaFunctionality = <
  TTransformedSchema,
  TContentTypes extends string,
>({
  contentTypes,
  override,
  fallbackValue,
  ...args
}: Input<TTransformedSchema, TContentTypes>): JSONSchemaFunctionality<
  TTransformedSchema,
  TContentTypes
> =>
  common.createJsonSchemaFunctionalityGeneric({
    ...args,
    stringDecoder: {
      transform: (decoder: types.AnyDecoder, cutOffTopLevelUndefined) =>
        convert.transformToJSONSchema(
          decoder,
          cutOffTopLevelUndefined,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
        ),
      override,
    },
    stringEncoder: {
      transform: (encoder: types.AnyEncoder, cutOffTopLevelUndefined) =>
        convert.transformToJSONSchema(
          encoder,
          cutOffTopLevelUndefined,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
        ),
      override,
    },
    encoders: common.arrayToRecord(
      [...contentTypes],
      (): common.SchemaTransformation<types.AnyEncoder> => ({
        transform: (validation, cutOffTopLevelUndefined) =>
          convert.transformToJSONSchema(
            validation,
            cutOffTopLevelUndefined,
            override,
            fallbackValue ?? common.getDefaultFallbackValue(),
          ),
        override,
      }),
    ),
    decoders: common.arrayToRecord(
      [...contentTypes],
      (): common.SchemaTransformation<types.AnyDecoder> => ({
        transform: (validation, cutOffTopLevelUndefined) =>
          convert.transformToJSONSchema(
            validation,
            cutOffTopLevelUndefined,
            override,
            fallbackValue ?? common.getDefaultFallbackValue(),
          ),
        override,
      }),
    ),
    getUndefinedPossibility,
  });

/**
 * This interface extends {@link common.JSONSchemaFunctionalityCreationArgumentsContentTypes}, and acts as input to {@link createJsonSchemaFunctionality} function.
 */
export interface Input<TTransformedSchema, TContentTypes extends string>
  extends common.JSONSchemaFunctionalityCreationArgumentsContentTypes<
    TTransformedSchema,
    TContentTypes,
    types.AnyEncoder | types.AnyDecoder
  > {
  /**
   * Optional callback to override certain encoders or decoders, as needed.
   */
  override?: common.OverrideGeneric<types.AnyEncoder | types.AnyDecoder>;
}

/**
 * This type specializes {@link common.SupportedJSONSchemaFunctionality} with `io-ts` specific generic type arguments.
 * It is used as return value of {@link createJsonSchemaFunctionality}.
 */
export type JSONSchemaFunctionality<
  TTransformedSchema,
  TContentTypes extends string,
> = common.SupportedJSONSchemaFunctionality<
  TTransformedSchema,
  types.AnyDecoder,
  types.AnyEncoder,
  Record<TContentTypes, common.SchemaTransformation<types.AnyEncoder>>,
  Record<TContentTypes, common.SchemaTransformation<types.AnyDecoder>>
>;

const getUndefinedPossibility: common.GetUndefinedPossibility<
  types.AnyEncoder | types.AnyDecoder
> = (validation) =>
  validation instanceof t.Type && validation.is(undefined)
    ? validation === t.undefined
      ? true
      : undefined
    : false;

// export type JSONSchemaFunctionalityCreationArguments<
//   TTransformedSchema,
//   TOutputContents extends common.TContentsBase,
//   TInputContents extends common.TContentsBase,
// > = common.JSONSchemaFunctionalityCreationArgumentsGeneric<
//   TTransformedSchema,
//   types.AnyDecoder,
//   types.AnyEncoder,
//   TOutputContents,
//   TInputContents
// >;
