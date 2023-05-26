/**
 * @file This types-only file contains helper types to extract the runtime and serialized types of the types defined in protocol specification.
 */

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import type * as t from "io-ts";
import type * as protocol from "@ty-ras/protocol";

/**
 * This is type to get the runtime representation of type which might be expressed as {@link protocol.Encoded}.
 * It doesn't need to be {@link protocol.Encoded} tho, and works for normal types as expected.
 */
export type GetRuntime<T> = protocol.RuntimeOf<T>;

/**
 * This is type to get the serialized ("encoded") representation of type which might be expressed as {@link protocol.Encoded}.
 * It doesn't need to be {@link protocol.Encoded} tho, and works for normal types as expected.
 */
export type GetEncoded<T> = T extends protocol.Encoded<infer _, infer TEncoded>
  ? TEncoded
  : T extends Array<infer U>
  ? GetEncodedArray<U>
  : T extends object
  ? GetEncodedObject<T>
  : T;

/**
 * This is helper type used by {@link GetEncoded}.
 * Client code should not use this directly.
 */
export type GetEncodedObject<T> = {
  [P in keyof T]: T[P] extends Function ? T[P] : GetEncoded<T[P]>;
};
/**
 * This is helper type used by {@link GetEncoded}.
 * Client code should not use this directly.
 */
export type GetEncodedArray<T> = Array<GetEncoded<T>>;

/**
 * This type materializes the [higher-kinded type](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) defined in TyRAS {@link protocol.HKTEncodedBase}.
 * It uses {@link GetEncoded} to provide the actual logic of extracting encoded type.
 */
export interface HKTEncoded extends protocol.HKTEncodedBase {
  /**
   * This property will be used to construct the final serialized ("encoded") type of some type defined in protocol specification.
   */
  readonly typeEncoded: GetEncoded<this["_TEncodedSpec"]>;
}

/**
 * Helper type to extract the runtime and encoded types of given `io-ts` validation object {@link t.Type}, when specifying types for protocol.
 */
export type ProtocolTypeOf<TValidation extends t.Type<any, any, any>> =
  TValidation extends t.Type<infer A, infer O, infer _>
    ? A extends O
      ? A // Just 'normal' validation like t.string, t.number, t.type, etc
      : protocol.Encoded<GetRuntime<A>, GetEncoded<O>> // The validation typically of 'io-ts-types' library, which takes one type as input, and produces another type as output (e.g. DateFromISOString)
    : never;
