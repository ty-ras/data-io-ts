import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as rawbody from "raw-body";

// TODO move this to @ty-ras/data-backend
export const requestBody = <T, TContentType extends string, TValidator>(
  validatorNative: TValidator,
  validator: data.DataValidator<unknown, T>,
  supportedContentType: TContentType,
  strictContentType: boolean,
  opts: rawbody.Options | undefined,
): dataBE.DataValidatorRequestInputSpec<
  T,
  Record<TContentType, TValidator>
> => {
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
    validator,
  );

  return {
    validator: async ({ contentType, input }) => {
      return contentType.startsWith(supportedContentType) ||
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
            supportedContentTypes: [supportedContentType],
          };
    },
    validatorSpec: {
      contents: {
        [supportedContentType]: validatorNative,
      } as Record<TContentType, TValidator>,
    },
  };
};

export const responseBody = <
  TOutput,
  TSerialized,
  TContentType extends string,
  TValidator,
>(
  validation: TValidator,
  validator: data.DataValidator<TOutput, TSerialized>,
  supportedContentType: TContentType,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  Record<TContentType, TValidator>
> => ({
  validator: (output) => {
    try {
      const result = validator(output);
      if (result.error === "none") {
        const success: dataBE.DataValidatorResponseOutputSuccess = {
          contentType: supportedContentType,
          output: JSON.stringify(result.data),
        };
        return {
          error: "none",
          data: success,
        };
      } else {
        return result;
      }
    } catch (e) {
      return data.exceptionAsValidationError(e);
    }
  },
  validatorSpec: {
    contents: {
      [supportedContentType]: validation,
    } as Record<TContentType, TValidator>,
  },
});
