import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";
import * as stringDecoder from "./string-decoder-generic";

export const urlParameters = <
  TValidation extends Record<string, URLParameterInfo<unknown>>,
>(
  validation: TValidation,
): dataBE.URLParameterValidatorSpec<
  GetURLData<TValidation>,
  common.Decoder<unknown>
> => ({
  validators: data.transformEntries(validation, (info) =>
    common.plainValidator("regExp" in info ? info.decoder : info),
  ) as dataBE.URLParameterValidators<GetURLData<TValidation>>,
  metadata: data.transformEntries(validation, (info) => ({
    decoder:
      "regExp" in info
        ? info.decoder
        : // ESLint says this doesn't change type, however TS disagrees, unfortunately
          (info as unknown as common.Decoder<unknown>),
    regExp: "regExp" in info ? info.regExp : dataBE.defaultParameterRegExp(),
  })),
});

export const queryValidator = <TValidation extends stringDecoder.TDecoderBase>(
  validation: TValidation,
): dataBE.QueryValidatorSpec<
  stringDecoder.GetDecoderData<TValidation>,
  common.Decoder<unknown>
> => stringDecoder.stringDecoder(validation, "Query");

export type URLParameterInfo<TValue> =
  | common.Decoder<TValue>
  | {
      decoder: common.Decoder<TValue>;
      regExp: RegExp;
    };

export type GetURLData<
  TValidation extends Record<string, URLParameterInfo<unknown>>,
> = {
  // No optional keys in URL data.
  [P in keyof TValidation]-?: TValidation[P] extends URLParameterInfo<
    infer TValue
  >
    ? TValue
    : never;
};
