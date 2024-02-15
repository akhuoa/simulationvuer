import { evaluateValue } from "./common.js";

export function initialiseUi(parent) {
  // Initialise some output-related data.

  parent.simulationUiInfo.output.data.forEach((data) => {
    parent.simulationDataId[data.id] = data.name;
  });

  let index = -1;

  parent.simulationUiInfo.output.plots.forEach((outputPlot) => {
    ++index;

    parent.layout[index] = {
      margin: {
        t: 5,
        l: 55,
        r: 55,
        b: 90,
        pad: 4
      },
      dragmode: "pan",
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
  // Finalise our UI, but only if we haven't already done so, we are mounted,
  // and we have some valid simulation UI information.

  if (!parent.hasFinalisedUi && parent.isMounted && parent.hasValidSimulationUiInfo) {
    // Configure the PlotVuer's.

    parent.$refs.output.classList.add("x" + parent.simulationUiInfo.output.plots.length);

    // Make sure that our UI is up to date.

    updateUi(parent);

    parent.hasFinalisedUi = true;
  }
}

export function updateUi(parent) {
  // Show/hide and enable/disable all the elements.
  // Note: we do this using $nextTick() to ensure that the UI has been fully
  //       mounted.

  parent.$nextTick(() => {
    let index = -1;

    parent.simulationUiInfo.input.forEach((input) => {
      ++index;

      parent.$refs.simInput[index].visible = (input.visible === undefined)?true:evaluateValue(parent, input.visible);
    });
  });
}
