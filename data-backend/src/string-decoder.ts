/**
 * @file This file contains functionality to decode (deserialize) the textual values: HTTP URL query parameters or HTTP headers.
 */

import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";

// TODO: At least parts of these can be put to @ty-ras/data-backend library
// Everything can be moved there once HKT for decoders and encoders are created.

/**
 * Creates a new {@link dataBE.StringDataValidatorSpec} from given named {@link common.Decoder}s.
 * Using this function directly in client code is very rare, since there exists separate functions for HTTP URL query parameter or HTTP header decoding.
 * @param validation The named {@link common.Decoder}s for URL query parameters or HTTP headers to decode.
 * @param itemName The name to use in error message if required item is missing. Typically is static string.
 * @returns A new {@link dataBE.StringDataValidatorSpec} which uses the given named {@link common.Decoder}s to decode the URL query parameters or HTTP headers into one object, each value being decoded value.
 */
export const stringDecoder = <TValidation extends TDecoderBase>(
  validation: TValidation,
  itemName: string,
): dataBE.StringDataValidatorSpec<
  GetDecoderData<TValidation>,
  { decoder: common.Decoder<unknown> },
  data.ReadonlyStringValue,
  { required: boolean }
> => {
  const finalValidators = data.transformEntries(
    validation,
    (singleValidation) => {
      const isRequired = singleValidation.decode(undefined)._tag === "Left";
      return {
        required: isRequired,
        decoder: singleValidation,
      };
    },
  );

  return {
    validators: data.transformEntries(
      finalValidators,
      ({ required, decoder }, itemNameParam) => {
        const plainValidator = common.fromDecoder(decoder);
        return required
          ? (item) =>
              item === undefined
                ? data.exceptionAsValidationError(
                    `${itemName} "${String(itemNameParam)}" is mandatory.`,
                  )
                : plainValidator(item)
          : plainValidator;
      },
    ) as dataBE.StringDataValidators<
      GetDecoderData<TValidation>,
      data.ReadonlyStringValue,
      true
    >,
    metadata: finalValidators,
  };
};

/**
 * This is the base constraint type for named string value decoders.
 */
export type TDecoderBase = Record<string, common.Decoder<unknown>>;

/**
 * This is helper type to extract the shape of the decoded value, when given named {@link common.Decoder}s.
 */
export type GetDecoderData<TValidation extends TDecoderBase> = {
  [P in Exclude<
    keyof TValidation,
    NonOptionalValidationKeys<TValidation>
  >]?: TValidation[P] extends common.Decoder<infer TValue> ? TValue : never;
} & {
  [P in NonOptionalValidationKeys<TValidation>]: TValidation[P] extends common.Decoder<
    infer TValue
  >
    ? TValue
    : never;
};

/**
 * This is helper type used by {@link GetDecoderData}.
 */
export type NonOptionalValidationKeys<T> = {
  [P in keyof T]-?: T[P] extends common.Decoder<infer TValue>
    ? undefined extends TValue
      ? never
      : P
    : never;
}[keyof T];
