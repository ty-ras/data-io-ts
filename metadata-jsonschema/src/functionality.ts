/**
 * @file This file contains function to invoke {@link common.createJsonSchemaFunctionalityGeneric} using `io-ts` lib-specific functionality (and leaving the rest to be specified as parameters.).
 */

import type * as data from "@ty-ras/data-io-ts";
import * as common from "@ty-ras/metadata-jsonschema";
import * as t from "io-ts";
import * as convert from "./transform";

/**
 * Creates new {@link JSONSchemaFunctionality} from given {@link Input}.
 * This function is typically meant to be used by other TyRAS libraries, and rarely directly by client code.
 * @param param0 The {@link Input} to this function.
 * @param param0.contentTypes Privately deconstructed variable.
 * @param param0.override Privately deconstructed variable.
 * @param param0.fallbackValue Privately deconstructed variable.
 * @param param0.requestBodyContentTypes Privately deconstructed variable.
 * @param param0.responseBodyContentTypes Privately deconstructed variable.
 * @returns The {@link JSONSchemaFunctionality} that can be used when creating metadata providers.
 */
export const createJsonSchemaFunctionality = <
  TTransformedSchema,
  TRequestBodyContentTypes extends string,
  TResponseBodyContentTypes extends string,
>({
  requestBodyContentTypes,
  responseBodyContentTypes,
  override,
  fallbackValue,
  ...args
}: Input<
  TTransformedSchema,
  TRequestBodyContentTypes,
  TResponseBodyContentTypes
>): JSONSchemaFunctionality<
  TTransformedSchema,
  TRequestBodyContentTypes,
  TResponseBodyContentTypes
> =>
  common.createJsonSchemaFunctionalityGeneric({
    ...args,
    stringDecoder: {
      transform: (decoder: data.AnyDecoder, cutOffTopLevelUndefined) =>
        convert.transformToJSONSchema(
          decoder,
          cutOffTopLevelUndefined,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
        ),
      override,
    },
    stringEncoder: {
      transform: (encoder: data.AnyEncoder, cutOffTopLevelUndefined) =>
        convert.transformToJSONSchema(
          encoder,
          cutOffTopLevelUndefined,
          override,
          fallbackValue ?? common.getDefaultFallbackValue(),
        ),
      override,
    },
    encoders: common.arrayToRecord(
      [...responseBodyContentTypes],
      (): common.SchemaTransformation<data.AnyEncoder> => ({
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
      [...requestBodyContentTypes],
      (): common.SchemaTransformation<data.AnyDecoder> => ({
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
export interface Input<
  TTransformedSchema,
  TRequestBodyContentTypes extends string,
  TResponseBodyContentTypes extends string,
> extends common.JSONSchemaFunctionalityCreationArgumentsContentTypes<
    TTransformedSchema,
    TRequestBodyContentTypes,
    TResponseBodyContentTypes,
    data.AnyEncoder | data.AnyDecoder
  > {
  /**
   * Optional callback to override certain encoders or decoders, as needed.
   */
  override?:
    | common.OverrideGeneric<data.AnyEncoder | data.AnyDecoder>
    | undefined;
}

/**
 * This type specializes {@link common.SupportedJSONSchemaFunctionality} with `io-ts` specific generic type arguments.
 * It is used as return value of {@link createJsonSchemaFunctionality}.
 */
export type JSONSchemaFunctionality<
  TTransformedSchema,
  TRequestBodyContentTypes extends string,
  TResponseBodyContentTypes extends string,
> = common.SupportedJSONSchemaFunctionality<
  TTransformedSchema,
  data.ValidatorHKT,
  TRequestBodyContentTypes,
  TResponseBodyContentTypes
>;

const getUndefinedPossibility: common.GetUndefinedPossibility<
  data.AnyEncoder | data.AnyDecoder
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
//   data.AnyDecoder,
//   data.AnyEncoder,
//   TOutputContents,
//   TInputContents
// >;
