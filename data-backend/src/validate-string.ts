import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";
import type * as h from "./header-parameters";

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
  ) as dataBE.URLParameterValidatorSpec<
    GetURLData<TValidation>,
    never
  >["validators"],
  metadata: data.transformEntries(validation, (info) => ({
    decoder:
      "regExp" in info
        ? info.decoder
        : // ESLint says this doesn't change type, however TS disagrees, unfortunately
          (info as unknown as common.Decoder<unknown>),
    regExp: "regExp" in info ? info.regExp : dataBE.defaultParameterRegExp(),
  })),
});

export const queryValidator = <
  TValidation extends Record<string, common.Decoder<unknown>>,
>(
  validation: TValidation,
): dataBE.QueryValidatorSpec<
  h.GetHeaderData<TValidation>,
  common.Decoder<unknown>
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
          ? (hdr) =>
              hdr === undefined
                ? data.exceptionAsValidationError(
                    `Header "${headerName}" is mandatory.`,
                  )
                : plainValidator(hdr)
          : plainValidator;
      },
    ) as dataBE.QueryValidatorSpec<
      h.GetHeaderData<TValidation>,
      never
    >["validators"],
    metadata: finalValidators,
  };
};

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
