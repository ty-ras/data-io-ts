import * as t from "io-ts";
import * as f from "fp-ts";

export class StringToNumber extends t.Type<number, string, string> {
  public constructor(name = "StringToNumber") {
    super(
      name,
      (n): n is number => typeof n === "number",
      (str, context) => {
        const maybeNumber = parseInt(str);
        return isNaN(maybeNumber)
          ? f.either.left([
              {
                context,
                value: str,
                message,
              },
            ])
          : f.either.right(maybeNumber);
      },
      (n) => `${n}`,
    );
  }
}

const message = "Given value was not a string representing integer.";
export const stringToNumber = new StringToNumber();
