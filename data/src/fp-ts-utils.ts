/**
 * @file This file contains functionality related to handling normal and `io-ts` errors.
 */
import * as errorFunctionality from "./error";
import * as t from "io-ts";
import { function as F, either as E } from "fp-ts";

/**
 * Helper utility to convert {@link t.Errors} or {@link Error} to one {@link Error}.
 * @param error The error.
 * @returns The {@link Error}.
 */
export const toError = (error: Error | t.Errors): Error =>
  error instanceof Error
    ? error
    : new Error(errorFunctionality.getHumanReadableErrorMessage(error));

/**
 * Helper utility to throw if the given object is `instanceof Error`.
 * @param obj The object to check.
 * @returns The `obj` if it is not `instanceof Error`
 * @throws The {@link Error} of `ob` is `instanceof Error`.
 */
export const throwIfError = <T>(obj: T): Exclude<T, Error> => {
  if (obj instanceof Error) {
    throw obj;
  }
  return obj as Exclude<T, Error>;
};

/**
 * Helper utility to always throw the given error (as `throw` is not an expression in JS/TS, but instead a statement).
 * @param error The {@link Error} to throw.
 */
export const throwOnError = (error: Error): never => {
  throw error;
};

/**
 * Helper method to chain {@link E.getOrElseW} and {@link throwIfError} via {@link F.flow}.
 */
export const getOrElseThrow = F.flow(E.getOrElseW(toError), throwIfError);
