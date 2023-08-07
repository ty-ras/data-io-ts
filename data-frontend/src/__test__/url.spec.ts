/**
 * @file This file contains unit tests for code in `../url.ts`.
 */

import test from "ava";
import * as spec from "../url";
import * as t from "io-ts";
import * as tt from "io-ts-types";

test("Validate that url validator gives static string when no args", (c) => {
  c.plan(1);
  const url = spec.url`/static/string`;
  c.deepEqual(url, "/static/string");
});

test("Validate that url validator gives function callback with args", (c) => {
  c.plan(1);
  const url = spec.url`/prefix/${spec.urlParam("param", t.string)}/suffix`;
  c.deepEqual(url({ param: "hello" }), {
    error: "none",
    data: "/prefix/hello/suffix",
  });
});

test("Validate that url validator works with more complex validators", (c) => {
  c.plan(1);
  const url = spec.url`/prefix/${spec.urlParam(
    "param",
    tt.NumberFromString,
  )}/suffix`;
  c.deepEqual(url({ param: 42 }), {
    error: "none",
    data: "/prefix/42/suffix",
  });
});
