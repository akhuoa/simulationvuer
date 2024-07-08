import { create, all } from "mathjs";

const math = create(all, {});

export const OPENCOR_SOLVER_NAME = "simcore/services/comp/opencor";

export function evaluateValue(parent, value) {
  let index = -1;
  const parser = new math.parser();

  parent.simulationUiInfo.input.forEach((input) => {
    ++index;

    parser.set(input.id, parent.$refs.simInput[index].vModel);
  });

  value = value.replace("===", "=="); //---GRY--- TO BE REMOVED ONCE DATASET 135 HAS BEEN FIXED.
  return parser.evaluate(value);
}
