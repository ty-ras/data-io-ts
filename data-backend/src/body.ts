import * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";
import * as rawbody from "raw-body";

// We only support json things for io-ts validation.
export const CONTENT_TYPE = "application/json" as const;

export const requestBody = <T>(
  validation: common.Decoder<T>,
  strictContentType = false,
  opts?: rawbody.Options,
): dataBE.DataValidatorRequestInputSpec<T, InputValidatorSpec<T>> =>
  dataBE.requestBodyGeneric(
    validation,
    common.plainValidator(validation),
    CONTENT_TYPE,
    strictContentType,
    async (readable, encoding) => {
      const bufferOrString = await rawbody.default(readable, {
        encoding: opts?.encoding ?? encoding,
        ...(opts ?? {}),
      });
      return bufferOrString instanceof Buffer
        ? bufferOrString.toString()
        : bufferOrString;
    },
  );

export const responseBody = <TOutput, TSerialized>(
  validation: common.Encoder<TOutput, TSerialized>,
  contentIsAlreadyValidated: boolean,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  OutputValidatorSpec<TOutput, TSerialized>
> =>
  dataBE.responseBodyGeneric(
    validation,
    common.plainValidatorEncoder(validation, contentIsAlreadyValidated),
    CONTENT_TYPE,
  );

export const responseBodyForValidatedData = <TOutput, TSerialized>(
  validation: common.Encoder<TOutput, TSerialized>,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  OutputValidatorSpec<TOutput, TSerialized>
> => responseBody(validation, true);

export type InputValidatorSpec<TData> = {
  [CONTENT_TYPE]: common.Decoder<TData>;
};

export type OutputValidatorSpec<TOutput, TSerialized> = {
  [CONTENT_TYPE]: common.Encoder<TOutput, TSerialized>;
};
