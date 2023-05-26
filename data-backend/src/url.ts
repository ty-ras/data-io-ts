/**
 * @file This file contains functionality to create generic TyRAS validators for URL and query parameters from 'native' `io-ts` decoders.
 */

import * as dataBE from "@ty-ras/data-backend";
import * as spec from "@ty-ras/endpoint-spec";
import * as common from "@ty-ras/data-io-ts";
import * as stringDecoder from "./string-decoder";
import * as t from "io-ts";

/**
 * Creates a new generic {@link spec.URLParameterInfo} for one URL path-encoded parameter, to be used when defining the URL path pattern for BE endpoint.
 * @param name The name of the URL parameter.
 * @param decoder The {@link common.Decoder} to validate the URL parameter.
 * @param regExp The optional RegExp to use. If not specified, the value of {@link dataBE.defaultParameterRegExp} will be used.
 * @returns A new generic {@link spec.URLParameterInfo} to be passed to TyRAS functions.
 */
export const urlParameter = <TName extends string, TDecoder extends t.Mixed>(
  name: TName,
  decoder: TDecoder,
  regExp?: RegExp,
): spec.URLParameterInfo<TName, t.TypeOf<TDecoder>, TDecoder> => ({
  name,
  regExp: regExp ?? dataBE.defaultParameterRegExp(),
  decoder,
  validator: common.fromDecoder(decoder),
});

/**
 * Creates a new generic {@link dataBE.QueryValidatorSpec} for all query parameters from named native {@link common.Decoder}s.
 * @param validation The named native {@link common.Decoder}s.
 * @returns A new generic {@link dataBE.QueryValidatorSpec} for all query parameters
 */
export const query = <TValidation extends stringDecoder.TDecoderBase>(
  validation: TValidation,
): dataBE.QueryValidatorSpec<
  stringDecoder.GetDecoderData<TValidation>,
  common.Decoder<unknown>
> => stringDecoder.stringDecoder(validation, "Query parameter");
