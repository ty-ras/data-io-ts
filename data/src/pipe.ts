import * as t from "io-ts";

export class Pipe<TSource, TTarget> extends t.Type<TTarget, TSource> {
  public readonly _tag = TAG;

  public constructor(
    public readonly stringType: t.Type<TSource>,
    public readonly transform: t.Type<TTarget, TSource, TSource>,
  ) {
    const piped = stringType.pipe(transform);
    super(transform.name, piped.is, piped.validate, piped.encode);
  }
}

export const TAG = "PipeTransform";
