/**
 * @file This file contains utility `io-ts` validator which converts between strings and numbers.
 */
import * as t from "io-ts";
import * as f from "fp-ts";

/**
 * This class implements {@link t.Type} to convert between strings and numbers.
 */
export class StringToNumber extends t.Type<number, string, string> {
  /**
   * Creates new instance of this class with given optional name.
   * @param name The name.
   */
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
