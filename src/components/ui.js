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

    // Make sure that the (vertical) scrollbar's thumb is of the right length.
    // Note: it may indeed be of the incorrect length if we hid some components
    //       in updateUi().

    parent.$nextTick(() => {
      parent.$refs.input.$el.scroll(0, 1);
      parent.$refs.input.$el.scroll(0, -1);
    });

    parent.hasFinalisedUi = true;
  }
}

export function updateUi(parent) {
  // Show/hide and enable/disable all the elements.
  // Note: we do this using $nextTick() to be ensure that the UI has been fully
  //       mounted.

  parent.$nextTick(() => {
    let index = -1;

    parent.simulationUiInfo.input.forEach((input) => {
      ++index;

      parent.$refs.input.$children[index].visible = (input.visible === undefined)?true:evaluateValue(parent, input.visible);
    });
  });
}
