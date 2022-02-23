function doEvaluateValue(value, from, to) {
  if (from !== undefined) {
    let re = new RegExp(`\\b${ from }\\b`, 'g');

    value = value.replace(re, to);
  }

  return value;
}

export function evaluateValue(ui, value) {
  ui.discreteElements.forEach((discreteElement) => {
    value = doEvaluateValue(value, discreteElement.id, discreteElement.select.vModel);
  });

  ui.scalarElements.forEach((scalarElement) => {
    value = doEvaluateValue(value, scalarElement.id, scalarElement.input_number.vModel);
  });

  return Function("return " + value + ";")();
}

export function evaluateSimulationValue(parent, results, value, i) {
  parent.json.output.data.forEach((data) => {
    value = doEvaluateValue(value, data.id, results[parent.simulationDataId[data.id]][i]);
  });

  return Function("return " + value + ";")();
}
