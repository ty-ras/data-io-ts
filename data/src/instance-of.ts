/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from "io-ts";

export class InstanceOf<
  T extends abstract new (...args: any) => any,
  TInput = unknown,
> extends t.Type<InstanceType<T>, InstanceType<T>, TInput> {
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

export const instanceOf = <T extends abstract new (...args: any) => any>(
  ctor: T,
  name?: string,
) =>
  new InstanceOf<T>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    `${name ?? `class ${ctor.prototype.constructor?.name ?? "<unnamed>"}`}`,
    ctor,
  );
