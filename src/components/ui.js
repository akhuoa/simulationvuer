import { evaluateValue } from "./common.js";

export function initialiseUi(parent) {
  // Initialise some input-related data.

  let index = -1;
  let isPreviousDiscrete = true;

  parent.json.input.forEach((input) => {
    let isDiscrete = input.possibleValues !== undefined;

    parent.firstScalarInput[++index] = !isDiscrete && isPreviousDiscrete;

    isPreviousDiscrete = isDiscrete;
  });

  // Initialise some output-related data.

  parent.json.output.data.forEach((data) => {
    parent.simulationDataId[data.id] = data.name;
  });

  index = -1;

  parent.json.output.plots.forEach((outputPlot) => {
    ++index;

    parent.layout[index] = {
      xaxis: {
        title: {
          text: outputPlot.xAxisTitle,
          font: {
            size: 10,
          },
        },
      },
      yaxis: {
        title: {
          text: outputPlot.yAxisTitle,
          font: {
            size: 10,
          },
        }
      },
    };

    parent.simulationData[index] = [{}];
  });
}

export function finaliseUi(parent) {
  // Configure the PlotVuer's.

  parent.$refs.output.classList.add("x" + parent.json.output.plots.length);

  // Make sure that our UI is up to date.

  updateUi(parent);
}

export function updateUi(parent) {
  // Enable/disable all the elements.
  // Note: we do this using $nextTick() to be ensure that the UI has been fully
  //       mounted.

  parent.$nextTick(() => {
    let index = -1;

    parent.json.input.forEach((input) => {
      parent.$children[++index].enabled = (input.enabled === undefined)?true:evaluateValue(parent, input.enabled);
    });
  });
}
