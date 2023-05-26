/**
 * @file This file contains utility method related to handling TyRAS objects within context of `fp-ts` library.
 */

import * as dataFE from "@ty-ras/data-frontend";
import { either as E } from "fp-ts";

/**
 * Converts given {@link dataFE.APICallResult} to {@link E.Either} of `fp-ts` library.
 * @param result The {@link dataFE.APICallResult}.
 * @returns The {@link E.Either} value of `fp-ts` library.
 */
export const toEither = <T>(
  result: dataFE.APICallResult<T>,
): E.Either<
  dataFE.APICallResultError,
  dataFE.APICallResultSuccess<T>["data"]
> => (result.error === "none" ? E.right(result.data) : E.left(result));
