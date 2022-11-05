/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as data from "@ty-ras/data-io-ts";
import type * as jsonSchema from "@ty-ras/metadata-jsonschema";

export type AnyEncoder = data.Encoder<any, any>;
export type AnyDecoder = data.Decoder<any>;
export type FallbackValue = jsonSchema.FallbackValue<AnyEncoder | AnyDecoder>;
export type Override = jsonSchema.Override<AnyEncoder | AnyDecoder>;
