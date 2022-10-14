import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";

// TODO: At least parts of these can be put to @ty-ras/data-backend library
// Everything can be moved there once HKT for decoders and encoders are created.
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
      ({ required, decoder }, headerNameParam) => {
        const headerName = headerNameParam as string;
        const plainValidator = common.plainValidator(decoder);
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
      GetDecoderData<TValidation>,
      data.ReadonlyStringValue,
      true
    >,
    metadata: finalValidators,
  };
};

export type TDecoderBase = Record<string, common.Decoder<unknown>>;

export type GetDecoderData<
  TValidation extends Record<string, common.Decoder<unknown>>,
> = {
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

export type NonOptionalValidationKeys<T> = {
  [P in keyof T]-?: T[P] extends common.Decoder<infer TValue>
    ? undefined extends TValue
      ? never
      : P
    : never;
}[keyof T];
