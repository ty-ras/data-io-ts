import * as dataBE from "@ty-ras/data-backend";
import * as spec from "@ty-ras/endpoint-spec";
import * as common from "@ty-ras/data-io-ts";
import * as stringDecoder from "./string-decoder-generic";
import * as t from "io-ts";

export const urlParameter = <TName extends string, TDecoder extends t.Mixed>(
  name: TName,
  decoder: TDecoder,
  regExp?: RegExp,
): spec.URLParameterInfo<TName, t.TypeOf<TDecoder>, TDecoder> => ({
  name,
  regExp: regExp ?? dataBE.defaultParameterRegExp(),
  decoder,
  validator: common.plainValidator(decoder),
});

export const query = <TValidation extends stringDecoder.TDecoderBase>(
  validation: TValidation,
): dataBE.QueryValidatorSpec<
  stringDecoder.GetDecoderData<TValidation>,
  common.Decoder<unknown>
> => stringDecoder.stringDecoder(validation, "Query parameter");
