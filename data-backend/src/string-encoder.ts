/**
 * @file This file contains functionality to encode (serialize) the textual values: HTTP URL query parameters or HTTP headers.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";

// TODO: At least parts of these can be put to @ty-ras/data-backend library
// Everything can be moved there once HKT for decoders and encoders are created.

/**
 * Creates a new {@link dataBE.StringDataValidatorSpec} from given named {@link common.Encoder}s.
 * Using this function directly in client code is very rare, since there exists separate functions for HTTP URL query parameter or HTTP header decoding.
 * @param validation The named {@link common.Encoder}s for URL query parameters or HTTP headers to decode.
 * @param itemName The name to use in error message if required item is missing. Typically is static string.
 * @returns A new {@link dataBE.StringDataValidatorSpec} which uses the given named {@link common.Encoder}s to decode the URL query parameters or HTTP headers into one object, each value being decoded value.
 */
export const stringEncoder = <TValidation extends TEncoderBase>(
  validation: TValidation,
  itemName: string,
): dataBE.StringDataValidatorSpec<
  GetEncoderData<TValidation>,
  { encoder: common.Encoder<unknown, data.HeaderValue> },
  data.HeaderValue,
  { required: boolean }
> => {
  const finalValidators = data.transformEntries(
    validation,
    (singleValidation) => {
      return {
        required: !singleValidation.is(undefined),
        encoder: singleValidation,
      };
    },
  );

  return {
    validators: data.transformEntries(
      finalValidators,
      ({ required, encoder }, itemNameParam) => {
        const plainValidator = common.fromEncoder(encoder);
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
      GetEncoderData<TValidation>,
      data.HeaderValue,
      false
    >,
    metadata: finalValidators,
  };
};

/**
 * This is the base constraint type for named string value encoders.
 */
export type TEncoderBase = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  common.Encoder<any, data.HeaderValue>
>;

/**
 * This is helper type to extract the shape of the decoded value, when given named {@link common.Encoder}s.
 */
export type GetEncoderData<
  TValidation extends Record<string, common.Encoder<unknown, unknown>>,
> = {
  [P in Exclude<
    keyof TValidation,
    NonOptionalResponseValidationKeys<TValidation>
  >]?: TValidation[P] extends common.Encoder<infer TValue, infer _>
    ? TValue
    : never;
} & {
  [P in NonOptionalResponseValidationKeys<TValidation>]: TValidation[P] extends common.Encoder<
    infer TValue,
    infer _
  >
    ? TValue
    : never;
};

/**
 * This is helper type used by {@link GetEncoderData}.
 */
export type NonOptionalResponseValidationKeys<T> = {
  [P in keyof T]-?: T[P] extends common.Encoder<infer TValue, infer _>
    ? undefined extends TValue
      ? never
      : P
    : never;
}[keyof T];
