/* eslint-disable @typescript-eslint/no-unused-vars */
import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";

// TODO: At least parts of these can be put to @ty-ras/data-backend library
// Everything can be moved there once HKT for decoders and encoders are created.
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
      ({ required, encoder }, headerNameParam) => {
        const headerName = headerNameParam as string;
        const plainValidator = common.plainValidatorEncoder(encoder, false);
        return required
          ? (item) =>
              item === undefined
                ? data.exceptionAsValidationError(
                    `${itemName} "${headerName}" is mandatory.`,
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

export type TEncoderBase = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  common.Encoder<any, data.HeaderValue>
>;

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

export type NonOptionalResponseValidationKeys<T> = {
  [P in keyof T]-?: T[P] extends common.Encoder<infer TValue, infer _>
    ? undefined extends TValue
      ? never
      : P
    : never;
}[keyof T];
