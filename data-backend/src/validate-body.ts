import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";
import * as rawbody from "raw-body";

// We only support json things for io-ts validation.
export const CONTENT_TYPE = "application/json" as const;

export const inputValidator = <T>(
  validation: common.Decoder<T>,
  strictContentType = false,
  opts?: rawbody.Options,
): dataBE.DataValidatorRequestInputSpec<T, InputValidatorSpec<T>> => {
  const jsonValidation = data.transitiveDataValidation(
    (inputString: string) => {
      if (inputString.length > 0) {
        try {
          return {
            error: "none",
            data: JSON.parse(inputString) as unknown,
          };
        } catch (e) {
          return data.exceptionAsValidationError(e);
        }
      } else {
        // No body supplied -> appear as undefined
        return {
          error: "none",
          data: undefined,
        };
      }
    },
    common.plainValidator(validation),
  );

  return {
    validator: async ({ contentType, input }) => {
      return contentType.startsWith(CONTENT_TYPE) ||
        (!strictContentType && contentType.length === 0)
        ? // stream._decoder || (state && (state.encoding || state.decoder))
          jsonValidation(
            await rawbody.default(input, {
              ...(opts ?? {}),
              // TODO get encoding from headers (or perhaps content type value? e.g. application/json;encoding=utf8)
              encoding: opts?.encoding ?? "utf8",
            }),
          )
        : {
            error: "unsupported-content-type",
            supportedContentTypes: [CONTENT_TYPE],
          };
    },
    validatorSpec: {
      contents: {
        [CONTENT_TYPE]: validation,
      },
    },
  };
};

export const outputValidator = <TOutput, TSerialized>(
  validation: common.Encoder<TOutput, TSerialized>,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  OutputValidatorSpec<TOutput, TSerialized>
> => ({
  validator: (output) => {
    try {
      const success: dataBE.DataValidatorResponseOutputSuccess = {
        contentType: CONTENT_TYPE,
        output: JSON.stringify(validation.encode(output)),
      };
      return {
        error: "none",
        data: success,
      };
    } catch (e) {
      return data.exceptionAsValidationError(e);
    }
  },
  validatorSpec: {
    contents: {
      [CONTENT_TYPE]: validation,
    },
  },
});

export type InputValidatorSpec<TData> = {
  [CONTENT_TYPE]: common.Decoder<TData>;
};

export type OutputValidatorSpec<TOutput, TSerialized> = {
  [CONTENT_TYPE]: common.Encoder<TOutput, TSerialized>;
};
