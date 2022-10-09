import test from "ava";
import * as spec from "../header-parameters";
import * as t from "io-ts";

test("Test that headersValidator works", (c) => {
  c.plan(1);
  const headerParamValue = t.string;
  const { validators, metadata } = spec.headersValidator({
    headerParam: headerParamValue,
  });
  c.deepEqual(metadata, {
    headerParam: {
      required: true,
      decoder: headerParamValue,
    },
  });
});
