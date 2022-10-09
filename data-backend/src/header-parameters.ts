import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-io-ts";
import * as stringDecoder from "./string-decoder-generic";
import * as stringEncoder from "./string-encoder-generic";

export const headersValidator = <
  TValidation extends stringDecoder.TDecoderBase,
>(
  validation: TValidation,
): dataBE.RequestHeaderDataValidatorSpec<
  stringDecoder.GetDecoderData<TValidation>,
  common.Decoder<unknown>
> => stringDecoder.stringDecoder(validation, "Header");

export const responseHeadersValidator = <
  TValidation extends stringEncoder.TEncoderBase,
>(
  validation: TValidation,
): dataBE.ResponseHeaderDataValidatorSpec<
  stringEncoder.GetEncoderData<TValidation>,
  common.Encoder<unknown, data.HeaderValue>
> => stringEncoder.stringEncoder(validation, "Header");

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
