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

  return eval(value);
}
