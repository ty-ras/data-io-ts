import type * as data from "@ty-ras/data-io-ts";
import type * as jsonSchema from "@ty-ras/metadata-jsonschema";

export type Encoder = data.Encoder<any, any>;
export type Decoder = data.Decoder<any>;
export type FallbackValue = jsonSchema.FallbackValue<Encoder | Decoder>;
export type Override = jsonSchema.Override<Encoder | Decoder>;
