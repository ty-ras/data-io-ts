/**
 * @file This file contains implementation for `instanceof` check using `io-ts` {@link t.Type}.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
import * as t from "io-ts";

/**
 * This class implements {@link t.Type} to provide `instanceof` check for the input.
 * The class is not meant to be used directly by client code, instead use the {@link instanceOf} function.
 */
export class InstanceOf<
  T extends abstract new (...args: any) => any,
  TInput = unknown,
> extends t.Type<InstanceType<T>, InstanceType<T>, TInput> {
  /**
   * Creates new instance of this class with given parameters.
   * This constructor is not meant to be called directly, instead use the {@link instanceOf} function.
   * @param name The name of the validation.
   * @param ctor The constructor of the class.
   */
  public constructor(name: string, ctor: T) {
    super(
      name,
      (i): i is InstanceType<T> => i instanceof ctor,
      (i, context) =>
        i instanceof ctor
          ? t.success(i as InstanceType<T>)
          : t.failure(i, context),
      (a) => a,
    );
  }
}

/**
 * Creates new instance of {@link InstanceOf} with given constructor and optionally a name.
 * @param ctor The constructor.
 * @param name The name for validation.
 * @returns The {@link InstanceOf} encapsulating `instanceof` check as {@link t.Type}.
 */
export const instanceOf = <T extends abstract new (...args: any) => any>(
  ctor: T,
  name?: string,
) =>
  new InstanceOf<T>(
    `${name ?? `class ${ctor.prototype?.constructor?.name ?? "<unnamed>"}`}`,
    ctor,
  );
