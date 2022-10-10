import * as dataFE from "@ty-ras/data-frontend";
import type * as data from "@ty-ras/data-io-ts";

export const createAPICallFactory = (
  callHttpEndpoint: dataFE.CallHTTPEndpoint,
) => dataFE.createAPICallFactory<data.HKTEncoded>(callHttpEndpoint);
