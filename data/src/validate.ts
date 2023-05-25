/**
 * @file This file contains functions to create TyRAS {@link data.DataValidator}s from 'native' `io-ts` decoders and encoders.
 */

import * as t from "io-ts";
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
        ? {
            _tag: "Right",
            right: validation.encode(input),
          }
        : {
            _tag: "Left",
            left: [
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
            ],
          },
    );
