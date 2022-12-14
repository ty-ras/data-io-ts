import * as dataFE from "@ty-ras/data-frontend";
import { either as E } from "fp-ts";

export const toEither = <T>(
  result: dataFE.APICallResult<T>,
): E.Either<
  dataFE.APICallResultError,
  dataFE.APICallResultSuccess<T>["data"]
> => (result.error === "none" ? E.right(result.data) : E.left(result));
