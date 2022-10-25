import test from "ava";
import * as spec from "../instance-of";

test("Validate that instanceOf works", (c) => {
  c.plan(6);
  const validation = spec.instanceOf(Date);
  c.deepEqual(validation.name, "class Date");

  const date = new Date();
  const dateString = "2020-01-01T00:00:00";
  c.true(validation.is(date));
  c.false(validation.is(dateString));
  c.is(validation.encode(date), date);
  c.deepEqual(validation.decode(date), {
    _tag: "Right",
    right: date,
  });
  c.deepEqual(validation.decode(dateString), {
    _tag: "Left",
    left: [
      {
        context: [
          {
            actual: dateString,
            key: "",
            type: validation,
          },
        ],
        message: undefined,
        value: dateString,
      },
    ],
  });
});

test("Validate that name gets passed to instanceOf result", (c) => {
  c.plan(1);
  c.deepEqual(spec.instanceOf(Date, "custom-name").name, "custom-name");
});
