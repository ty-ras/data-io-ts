/**
 * @file This file contains the `io-ts` -specific implementation of {@link state.createStateValidatorFactoryGeneric}.
 */

import * as t from "io-ts";
import { either as E } from "fp-ts";
import * as data from "@ty-ras/data-io-ts";
import * as state from "@ty-ras/state";
import type * as types from "./state.types";

/**
 * This function narrows down the generic {@link state.createStateValidatorFactoryGeneric} function with `io-ts` specific {@link data.ValidatorHKT}.
 * The result of this function is a callback that can be used to create state information objects needed when defining endpoints.
 * @param validation The object containing information about state properties, typically result of {@link state.getFullStateValidationInfo}.
 * @returns A {@link CreateStateInformationFactory} callback to use to create state information objects needed when defining endpoints.
 */
export const createStateValidatorFactory = <
  TStateValidation extends types.TStateValidationBase,
>(
  validation: TStateValidation,
): CreateStateInformationFactory<TStateValidation> =>
  state.createStateValidatorFactoryGeneric<data.ValidatorHKT, TStateValidation>(
    validation,
    (mandatory, optional) => {
      const validator = t.intersection([
        t.type(
          Object.fromEntries(
            mandatory.map(
              (mandatoryProp) =>
                [mandatoryProp, validation[mandatoryProp].validation] as const,
            ),
          ),
        ),
        t.partial(
          Object.fromEntries(
            optional.map(
              (optionalProp) =>
                [optionalProp, validation[optionalProp].validation] as const,
            ),
          ),
        ),
      ]);
      return (input) => {
        const result = validator.decode(input);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return E.isRight(result)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data.transformLibraryResultToModelResult(result) as any)
          : {
              ...data.createErrorObject(result.left),
              erroneousProperties: result.left.flatMap((err) =>
                err.context.map((ctx) => ctx.key),
              ),
            };
      };
    },
  );

/**
 * This type narrows the generic {@link state.CreateStateInformationFactoryGeneric} with `io-ts` -specific {@link data.ValidatorHKT}.
 */
export type CreateStateInformationFactory<
  TStateValidation extends types.TStateValidationBase,
> = state.CreateStateInformationFactoryGeneric<
  data.ValidatorHKT,
  TStateValidation
>;
