/**
 * @file This file contains `io-ts` validators for all HTTP method strings.
 */
import * as t from "io-ts";
import * as data from "@ty-ras/data";
import * as validate from "./validate";

export const DELETE = validate.fromDecoder(t.literal(data.METHOD_DELETE));
export const GET = validate.fromDecoder(t.literal(data.METHOD_GET));
export const HEAD = validate.fromDecoder(t.literal(data.METHOD_HEAD));
export const OPTIONS = validate.fromDecoder(t.literal(data.METHOD_OPTIONS));
export const PATCH = validate.fromDecoder(t.literal(data.METHOD_PATCH));
export const POST = validate.fromDecoder(t.literal(data.METHOD_POST));
export const PUT = validate.fromDecoder(t.literal(data.METHOD_PUT));
export const TRACE = validate.fromDecoder(t.literal(data.METHOD_TRACE));
