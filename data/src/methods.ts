import * as t from "io-ts";
import * as data from "@ty-ras/data";
import * as validate from "./validate";

export const DELETE = validate.plainValidator(t.literal(data.METHOD_DELETE));
export const GET = validate.plainValidator(t.literal(data.METHOD_GET));
export const HEAD = validate.plainValidator(t.literal(data.METHOD_HEAD));
export const OPTIONS = validate.plainValidator(t.literal(data.METHOD_OPTIONS));
export const PATCH = validate.plainValidator(t.literal(data.METHOD_PATCH));
export const POST = validate.plainValidator(t.literal(data.METHOD_POST));
export const PUT = validate.plainValidator(t.literal(data.METHOD_PUT));
export const TRACE = validate.plainValidator(t.literal(data.METHOD_TRACE));
