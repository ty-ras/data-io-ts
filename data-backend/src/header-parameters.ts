import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";

export const headersValidator = <
  TValidation extends Record<string, common.Decoder<unknown>>,
>(
  validation: TValidation,
): dataBE.RequestHeaderDataValidatorSpec<
  GetHeaderData<TValidation>,
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
    ) as dataBE.RequestHeaderDataValidatorSpec<
      GetHeaderData<TValidation>,
      never
    >["validators"],
    metadata: finalValidators,
  };
};

export const responseHeadersValidator = <
  TValidation extends Record<string, common.Encoder<any, data.HeaderValue>>,
>(
  validation: TValidation,
): dataBE.ResponseHeaderDataValidatorSpec<
  GetResponseHeaderData<TValidation>,
  common.Encoder<unknown, data.HeaderValue>
> => {
  const finalValidators = data.transformEntries(
    validation,
    (singleValidation) => {
      let isRequired = true;
      try {
        singleValidation.encode(undefined);
        isRequired = false;
      } catch {
        // Ignore
      }
      return {
        required: isRequired,
        encoder: singleValidation,
      };
    },
  );

  return {
    validators: data.transformEntries(
      finalValidators,
      ({ required, encoder }, headerNameParam) => {
        const headerName = headerNameParam as string;
        const plainValidator = common.plainValidatorEncoder(encoder);
        return required
          ? (hdr) =>
              hdr === undefined
                ? data.exceptionAsValidationError(
                    `Header "${headerName}" is mandatory.`,
                  )
                : plainValidator(hdr)
          : plainValidator;
      },
    ) as dataBE.ResponseHeaderDataValidatorSpec<
      GetResponseHeaderData<TValidation>,
      never
    >["validators"],
    metadata: finalValidators,
  };
};

export type GetHeaderData<
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

export type GetResponseHeaderData<
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

// TODO move this + others to separate file or lib
// export const stringParameterBoolean = new common.Pipe(
//   t.keyof({ true: true, false: true }),
//   new t.Type(
//     "Boolean as a string",
//     (i): i is boolean => typeof i === "boolean",
//     (i) => t.success(i === "true"),
//     (i) => (i ? "true" : "false"),
//   ),
// );
