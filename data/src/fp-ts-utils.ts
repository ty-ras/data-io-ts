import * as errorFunctionality from "./error";
import * as t from "io-ts";
import { function as F, either as E } from "fp-ts";

export type SupportedErrors = Error | t.Errors;

export const toError = (error: SupportedErrors): Error =>
  error instanceof Error
    ? error
    : new Error(errorFunctionality.getHumanReadableErrorMessage(error));

export const throwIfError = <T>(obj: T): Exclude<T, Error> => {
  if (obj instanceof Error) {
    throw obj;
  }
  return obj as Exclude<T, Error>;
};

export const throwOnError = (error: Error): never => {
  throw error;
};

// TODO All the various "geq" etc variations of number and so on, could be gathered in separate file/package
export const nonEmptyString = t.refinement(t.string, (str) => str.length > 0);

export const getOrElseThrow = F.flow(E.getOrElseW(toError), throwIfError);
