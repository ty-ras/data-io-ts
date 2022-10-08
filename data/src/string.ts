import * as t from "io-ts";

export class StringPipe<TString extends string, TValue> extends t.Type<
  TValue,
  TString
> {
  public readonly _tag = "StringPipe";

  public constructor(
    public readonly stringType: t.Type<TString>,
    public readonly transform: t.Type<TValue, TString, TString>,
  ) {
    const piped = stringType.pipe(transform);
    super(transform.name, piped.is, piped.validate, piped.encode);
  }
}
