/**
 * @file This file contains functions to create TyRAS {@link data.DataValidator}s from 'native' `io-ts` decoders and encoders.
 */

import * as t from "io-ts";
import { either as E } from "fp-ts";
import * as data from "@ty-ras/data";
import * as utils from "./utils";

/**
 * This is the TyRAS decoder type for 'native' `io-ts` {@link t.Decoder} type.
 */
export type Decoder<TData, TInput = unknown> = t.Decoder<TInput, TData> & {
  _tag?: string;
};

/**
 * This is the TyRAS encoder type for 'native' `io-ts` {@link t.Encoder} type.
 */
export type Encoder<TOutput, TSerialized> = t.Encoder<TOutput, TSerialized> & {
  is: t.Is<TOutput>;
  _tag?: string;
};

/**
 * This interface "implements" the generic [HKT](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again), {@link data.ValidatorHKTBase}, to use `io-ts` {@link t.Decoder} and {@link t.Encoder} as TyRAS decoders and encoders, respectively.
 */
export interface ValidatorHKT extends data.ValidatorHKTBase {
  /**
   * This property "implements" the {@link data.ValidatorHKTBase._getDecoder} property in order to provide functionality for {@link data.MaterializeDecoder} type.
   * @see Decoder
   */
  readonly _getDecoder: Decoder<this["_argDecodedType"]>;

  /**
   * This property "implements" the {@link data.ValidatorHKTBase._getEncoder} property in order to provide functionality for {@link data.MaterializeEncoder} type.
   * @see Encoder
   */
  readonly _getEncoder: Encoder<
    this["_argDecodedType"],
    this["_argEncodedType"]
  >;

  /**
   * This property "implements" the {@link data.ValidatorHKTBase._getDecodedType} property in order to provide functionality for {@link data.MaterializeDecodedType} type.
   */
  readonly _getDecodedType: this["_argDecoder"] extends t.Type<
    infer TDecodedType,
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    any // eslint-disable-line @typescript-eslint/no-explicit-any
  >
    ? TDecodedType
    : never;
}

/**
 * This type provides `io-ts` specific type for {@link data.AnyDecoderGeneric}.
 */
export type AnyDecoder = data.AnyDecoderGeneric<ValidatorHKT>;

/**
 * This type provides `io-ts` specific type for {@link data.AnyEncoderGeneric}.
 */
export type AnyEncoder = data.AnyEncoderGeneric<ValidatorHKT>;

/**
 * Creates a new {@link data.DataValidator} from given {@link t.Decoder}, wrapping its 'native' `io-ts` API into uniform TyRAS API.
 * @param validation The {@link t.Decoder}.
 * @returns A {@link data.DataValidator} which behaves like given `validation`.
 */
export const fromDecoder =
  <TInput, TData>(
    validation: Decoder<TData, TInput>,
  ): data.DataValidator<TInput, TData> =>
  (input) =>
    utils.transformLibraryResultToModelResult(validation.decode(input));

/**
 * Creates a new {@link data.DataValidator} from given {@link t.Encoder}, wrapping its 'native' `io-ts` API into uniform TyRAS API.
 * @param validation The {@link t.Encoder}.
 * @returns A {@link data.DataValidator} which behaves like given `validation`.
 */
export const fromEncoder =
  <TOutput, TSerialized>(
    validation: Encoder<TOutput, TSerialized>,
  ): data.DataValidator<TOutput, TSerialized> =>
  (input) =>
    utils.transformLibraryResultToModelResult(
      validation.is(input)
        ? E.right(validation.encode(input))
        : E.left([
            {
              context: [
                {
                  actual: input,
                  key: "",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  type: validation as t.Type<any>,
                },
              ],
              value: input,
              message:
                "Given value for input was not what the validator needed.",
            },
          ]),
    );
