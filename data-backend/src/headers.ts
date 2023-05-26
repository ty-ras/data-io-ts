/**
 * @file This file contains code to create generic TyRAS callbacks from 'native' `io-ts` validators, for HTTP request and response headers validation.
 */

import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";
import * as stringDecoder from "./string-decoder";
import * as stringEncoder from "./string-encoder";

/**
 * Creates a new generic TyRAS {@link dataBE.RequestHeaderDataValidatorSpec} for validating request headers, wrapping named native `io-ts` {@link common.Decoder}.
 * @param validation The named {@link common.Decoder}s, each responsible for validating the request header value. The key is header name, and the value is the {@link common.Decoder}.
 * @returns The {@link data.RequestHeaderDataValidatorSpec} that can be passed to TyRAS functions as response body validator.
 */
export const requestHeaders = <TValidation extends stringDecoder.TDecoderBase>(
  validation: TValidation,
): dataBE.RequestHeaderDataValidatorSpec<
  stringDecoder.GetDecoderData<TValidation>,
  common.Decoder<unknown>
> => stringDecoder.stringDecoder(validation, "Header");

/**
 * Creates a new generic TyRAS {@link dataBE.ResponseHeaderDataValidatorSpec} for validating response headers, wrapping named native `io-ts` {@link common.Encoder}.
 * @param validation The named {@link common.Encoder}s, each responsible for validating the response header value. The key is header name, and the value is the {@link common.Encoder}.
 * @returns The {@link data.ResponseHeaderDataValidatorSpec} that can be passed to TyRAS functions as response body validator.
 */
export const responseHeaders = <TValidation extends stringEncoder.TEncoderBase>(
  validation: TValidation,
): dataBE.ResponseHeaderDataValidatorSpec<
  stringEncoder.GetEncoderData<TValidation>,
  common.Encoder<unknown, data.HeaderValue>
> => stringEncoder.stringEncoder(validation, "Header");
