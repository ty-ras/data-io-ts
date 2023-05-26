/**
 * @file This types-only file contains types used by this library, which specialize the generic types from other libraries.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as data from "@ty-ras/data-io-ts";
import type * as jsonSchema from "@ty-ras/metadata-jsonschema";

/**
 * This is helper type to express encoder from any value to any other value.
 */
export type AnyEncoder = data.Encoder<any, any>;

/**
 * This is helper type to express decoder to any value.
 */
export type AnyDecoder = data.Decoder<any>;

/**
 * This type customizes generic {@link jsonSchema.FallbackValueGeneric} type with `io-ts` specific generic arguments.
 */
export type FallbackValue = jsonSchema.FallbackValueGeneric<
  AnyEncoder | AnyDecoder
>;

/**
 * This type customizes generic {@link jsonSchema.OverrideGeneric} type with `io-ts` specific generic arguments.
 */
export type Override = jsonSchema.OverrideGeneric<AnyEncoder | AnyDecoder>;
