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

export const validateFromMaybeStringifiedJSON =
  <TValidation extends t.Mixed>(
    validation: TValidation,
    makeErrorIfNotString: (value: unknown) => Error,
  ): ((
    maybeJsonString: unknown,
  ) => E.Either<SupportedErrors, t.TypeOf<TValidation>>) =>
  (maybeJsonString) =>
    F.pipe(
      maybeJsonString,
      (envVar) => nonEmptyString.decode(envVar),
      E.mapLeft(() => makeErrorIfNotString(maybeJsonString)),
      E.chain(validateFromStringifiedJSON(validation)),
    );

export const validateFromStringifiedJSON =
  <TValidation extends t.Mixed>(
    validation: TValidation,
  ): ((
    jsonString: string,
  ) => E.Either<SupportedErrors, t.TypeOf<TValidation>>) =>
  (jsonString) =>
    F.pipe(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      E.tryCatch(() => JSON.parse(jsonString), E.toError),
      E.chainW((configAsUnvalidated) => validation.decode(configAsUnvalidated)),
    );

export const getOrElseThrow = <T>(e: E.Either<SupportedErrors, T>): T =>
  F.pipe(e, E.getOrElseW(toError), throwIfError);

export const readJSONStringToValueOrThrow =
  <TValidation extends t.Mixed>(
    validation: TValidation,
    makeErrorIfNotString: (value: unknown) => Error,
  ): ((maybeJsonString: unknown) => t.TypeOf<TValidation>) =>
  (maybeJsonString) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    F.pipe(
      maybeJsonString,
      validateFromMaybeStringifiedJSON(validation, makeErrorIfNotString),
      getOrElseThrow,
    );
