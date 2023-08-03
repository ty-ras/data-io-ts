/**
 * @file This file contains `io-ts` validators for all HTTP method strings.
 */

import * as t from "io-ts";
import * as protocol from "@ty-ras/protocol";
import * as validate from "./validate";

export const DELETE = validate.fromDecoder(t.literal(protocol.METHOD_DELETE));
export const GET = validate.fromDecoder(t.literal(protocol.METHOD_GET));
export const HEAD = validate.fromDecoder(t.literal(protocol.METHOD_HEAD));
export const OPTIONS = validate.fromDecoder(t.literal(protocol.METHOD_OPTIONS));
export const PATCH = validate.fromDecoder(t.literal(protocol.METHOD_PATCH));
export const POST = validate.fromDecoder(t.literal(protocol.METHOD_POST));
export const PUT = validate.fromDecoder(t.literal(protocol.METHOD_PUT));
export const TRACE = validate.fromDecoder(t.literal(protocol.METHOD_TRACE));
