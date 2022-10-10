import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";
import type * as rawbody from "raw-body";
import * as body from "./body-generic";

// We only support json things for io-ts validation.
export const CONTENT_TYPE = "application/json" as const;

export const requestBody = <T>(
  validation: common.Decoder<T>,
  strictContentType = false,
  opts?: rawbody.Options,
): dataBE.DataValidatorRequestInputSpec<T, InputValidatorSpec<T>> =>
  body.requestBody(
    validation,
    common.plainValidator(validation),
    CONTENT_TYPE,
    strictContentType,
    opts,
  );

export const responseBody = <TOutput, TSerialized>(
  validation: common.Encoder<TOutput, TSerialized>,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  OutputValidatorSpec<TOutput, TSerialized>
> =>
  body.responseBody(
    validation,
    common.plainValidatorEncoder(validation),
    CONTENT_TYPE,
  );

export type InputValidatorSpec<TData> = {
  [CONTENT_TYPE]: common.Decoder<TData>;
};

export type OutputValidatorSpec<TOutput, TSerialized> = {
  [CONTENT_TYPE]: common.Encoder<TOutput, TSerialized>;
};
