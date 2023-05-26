/**
 * @file This file contains unit tests for functionality in file `../api-call.ts`.
 */

import test from "ava";
import * as spec from "..";
import * as dataFE from "@ty-ras/data-frontend";
import * as data from "@ty-ras/data-io-ts";
import * as t from "io-ts";

test("Validate createAPICallFactory works", async (c) => {
  c.plan(2);
  const seenArgs: Array<dataFE.HTTPInvocationArguments> = [];
  const response: dataFE.HTTPInvocationResult = {
    body: "body",
  };
  const factory = spec.createAPICallFactoryWithCallback(
    (args) => (seenArgs.push(args), Promise.resolve(response)),
  );
  const url = "/path";
  const apiResponse = await factory
    .withHeaders({})
    .makeAPICall<ProtocolEndpoint>({
      method: "GET",
      response: data.fromDecoder(t.string),
      url,
    })();
  c.deepEqual(seenArgs, [
    {
      method: "GET",
      url,
    },
  ]);
  c.deepEqual(apiResponse, {
    error: "none",
    data: response.body,
  });
});

interface ProtocolEndpoint {
  method: "GET";
  responseBody: string;
}
