/**
 * @file This file contains utility function to wrap 'native' `io-ts` {@link t.Validation} into TyRAS {@link data.DataValidatorResult}.
 */
import * as t from "io-ts";
import type * as data from "@ty-ras/data";
import * as error from "./error";

/**
 * This function will wrap the given 'native' `io-ts` {@link t.Validation} into TyRAS {@link data.DataValidatorResult}.
 * @param validationResult The {@link t.Validation} validation result.
 * @returns The {@link data.DataValidatorResult}, either {@link data.DataValidatorResultError} or {@link data.DataValidatorResultSuccess}
 */
export const transformLibraryResultToModelResult = <TData>(
  validationResult: t.Validation<TData>,
): data.DataValidatorResult<TData> =>
  validationResult._tag === "Right"
    ? {
        error: "none",
        data: validationResult.right,
      }
    : {
        error: "error",
        errorInfo: validationResult.left,
        getHumanReadableMessage: () =>
          error.getHumanReadableErrorMessage(validationResult.left),
      };
