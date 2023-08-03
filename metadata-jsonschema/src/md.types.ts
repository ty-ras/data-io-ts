/**
 * @file This types-only file contains types used by this library, which specialize the generic types from other libraries.
 */

import type * as data from "@ty-ras/data-io-ts";
import type * as jsonSchema from "@ty-ras/metadata-jsonschema";

/**
 * This type customizes generic {@link jsonSchema.FallbackValueGeneric} type with `io-ts` specific generic arguments.
 */
export type FallbackValue = jsonSchema.FallbackValueGeneric<
  data.AnyEncoder | data.AnyDecoder
>;

/**
 * This type customizes generic {@link jsonSchema.OverrideGeneric} type with `io-ts` specific generic arguments.
 */
export type Override = jsonSchema.OverrideGeneric<
  data.AnyEncoder | data.AnyDecoder
>;
