/**
 * @file This file contains functionality related to validation errors when using `io-ts` library with TyRAS.
 */

import type * as data from "@ty-ras/data";
import * as t from "io-ts";
// import { PathReporter } from "io-ts/PathReporter";

/**
 * This type is the data validation error resulting from `io-ts` validators.
 */
export type ValidationError = t.Errors;

/**
 * Function to extract textual error from `io-ts` {@link ValidationError}.
 * @param error The {@link ValidationError}.
 * @returns Textual representation of the error, as specified by `PathReporter` of `io-ts`.
 */
export const getHumanReadableErrorMessage = (error: ValidationError) =>
  failure(error).join("  \n");
// PathReporter.report({
//   _tag: "Left",
//   left: error,
// }).join("  \n");

/**
 * Function to create {@link data.DataValidatorResultError} from given {@link ValidationError}.
 * @param errorInfo The {@link ValidationError}.
 * @returns The {@link data.DataValidatorResultError} with given error as `errorInfo` property, and `getHumanREadableMessage` being {@link getHumanReadableErrorMessage}.
 */
export const createErrorObject = (
  errorInfo: ValidationError,
): data.DataValidatorResultError => ({
  error: "error",
  errorInfo,
  getHumanReadableMessage: () => getHumanReadableErrorMessage(errorInfo),
});

// Right now, doing this breaks at runtime:
// import { PathReporter } from "io-ts/PathReporter";
// With error:
// Error: Cannot find module '<base>/node_modules/io-ts/PathReporter' imported from <base>/src/api/data/io-ts/error.ts
// It is because ESM version of io-ts is a bit broken, and probably won't be fixed until 3.x.
// As an emergency patch, I duplicate functionality of PathReporter here.
/* c8 ignore start */
const failure = (errors: t.Errors) => errors.map(getMessage);
const getMessage = (e: t.ValidationError) =>
  e.message !== undefined
    ? e.message
    : `Invalid value ${stringify(e.value)} supplied to ${getContextPath(
        e.context,
      )}`;
const stringify = (v: unknown) => {
  if (typeof v === "function") {
    return t.getFunctionName(v);
  }
  if (typeof v === "number" && !isFinite(v)) {
    if (isNaN(v)) {
      return "NaN";
    }
    return v > 0 ? "Infinity" : "-Infinity";
  }
  return JSON.stringify(v);
};
const getContextPath = (context: t.Context) => {
  return context.map(({ key, type }) => `${key}: ${type.name}`).join("/");
};
/* c8 ignore stop */
