<template>
  <div class="simulation-vuer" v-loading="simulationBeingComputed" :element-loading-text="simulationBeingComputedLabel">
    <p v-show="mode === -1" class="default error"><span class="error">Error:</span> an unknown model was provided.</p>
    <el-container class="main" v-show="mode !== -1">
      <el-aside width="212px">
        <p class="default name">{{entry.name}}</p>
        <p class="default description">{{entry.description}}</p>
        <p class="default input-parameters">Input parameters</p>
        <div v-show="mode === 0">
          <p class="default simulation-mode">Simulation mode</p>
          <el-select class="simulation-mode" popper-class="simulation-mode-popper" :popper-append-to-body="false" v-model="simulationMode" size="mini" @change="simulationModeChanged()">
            <el-option v-for="simulationMode in simulationModes" :key="simulationMode.value" :label="simulationMode.label" :value="simulationMode.value" />
          </el-select>
          <p class="default stimulation-level">Stimulation level</p>
          <div class="stimulation-level">
            <el-slider v-model="stimulationLevel" :max="10" :show-tooltip="false" :show-input="false" :disabled="simulationMode == 0" />
            <el-input-number v-model="stimulationLevel" size="mini" :controls="false" :min="0" :max="10" :disabled="simulationMode == 0" />
          </div>
        </div>
        <div v-show="mode === 1">
          <p class="default spike-frequency">Spike frequency</p>
          <div class="spike-frequency">
            <el-slider v-model="simulationSpikeFrequency" :max="1000" :show-tooltip="false" :show-input="false" />
            <el-input-number v-model="simulationSpikeFrequency" size="mini" :controls="false" :min="0" :max="1000" />
          </div>
          <p class="default spike-number">Spike number</p>
          <div class="spike-number">
            <el-slider v-model="simulationSpikeNumber" :max="30" :show-tooltip="false" :show-input="false" />
            <el-input-number v-model="simulationSpikeNumber" size="mini" :controls="false" :min="0" :max="30" />
          </div>
          <p class="default spike-amplitude">Spike amplitude</p>
          <div class="spike-amplitude">
            <el-slider v-model="simulationSpikeAmplitude" :max="30" :show-tooltip="false" :show-input="false" />
            <el-input-number v-model="simulationSpikeAmplitude" size="mini" :controls="false" :min="0" :max="30" />
          </div>
        </div>
        <div class="primary-button">
          <el-button type="primary" size="mini" @click="runSimulation()">Run simulation</el-button>
        </div>
        <div class="secondary-button">
          <el-button size="mini" @click="goToOsparc()">Go to oSPARC</el-button>
        </div>
        <div class="secondary-button">
          <el-button size="mini" @click="viewDataset()">View dataset</el-button>
        </div>
      </el-aside>
      <div class="plot-vuer" v-show="simulationValid" style="display: grid">
        <div v-show="mode === 1">
          <PlotVuer :layout-input="simulationSpikeLayout" :dataInput="simulationSpikeData" :plotType="'plotly-only'" />
        </div>
        <div>
          <PlotVuer :layout-input="simulationPotentialLayout" :dataInput="simulationPotentialData" :plotType="'plotly-only'" />
        </div>
      </div>
      <div v-show="!simulationValid">
        <p class="default error"><span class="error">Error:</span> <span v-html="errorMessage"></span>.</p>
      </div>
    </el-container>
  </div>
</template>

<script>
import Vue from "vue";
import { PlotVuer } from "@abi-software/plotvuer";
import "@abi-software/plotvuer/dist/plotvuer.css";
import { Aside, Button, Container, InputNumber, Loading, Main, Option, Select, Slider } from "element-ui";

var NoSimulationData = [{}];

Vue.use(Aside);
Vue.use(Button);
Vue.use(Container);
Vue.use(InputNumber);
Vue.use(Loading);
Vue.use(Main);
Vue.use(Option);
Vue.use(Select);
Vue.use(Slider);

export default {
  name: "SimulationVuer",
  components: {
    PlotVuer,
  },
  props: {
    apiLocation: {
      type: String,
      default: "",
    },
    entry: {
      /**
       * Object containing information for the current simulation.
       */
      entry: Object,
    },
  },
  data: function () {
    return {
      mode: 0,
      errorMessage: "",
      stimulationLevel: 0,
      simulationMode: 0,
      simulationModes: [
        {
          label: "Normal sinus rhythm",
          value: 0,
        },
        {
          label: "Stellate stimulation",
          value: 1,
        },
        {
          label: "Vagal stimulation",
          value: 2,
        },
      ],
      simulationSpikeLayout: {
        xaxis: {
          title: {
            text: "Time (s)",
            font: {
              size: 10,
            },
          },
        },
        yaxis: {
          title: {
            text: "Spike amplitude",
            font: {
              size: 10,
            },
          }
        },
      },
      simulationSpikeFrequency: 300,
      simulationSpikeNumber: 10,
      simulationSpikeAmplitude: 10, // The real value is 100 times smaller.
      simulationSpikeData: NoSimulationData,
      simulationPotentialLayout: {
        xaxis: {
          title: {
            text: "Time (s)",
            font: {
              size: 10,
            },
          },
        },
        yaxis: {
          title: {
            text: "Membrane potential (mV)",
            font: {
              size: 10,
            },
          }
        },
      },
      simulationPotentialData: NoSimulationData,
      simulationBeingComputed: false,
      simulationBeingComputedLabel: "Loading simulation results...",
      simulationValid: true,
    };
  },
  methods: {
    goToOsparc() {
      window.open("https://osparc.io/", "_blank");
    },
    viewDataset() {
      window.open(this.entry.dataset, "_blank");
    },
    simulationModeChanged() {
      this.simulationPotentialData = NoSimulationData;
      this.simulationValid = true;
    },
    runSimulation() {
      this.simulationBeingComputed = true;

      var request = {
        model_url: this.entry.resource,
        json_config: {
          output: ["Membrane/V"],
        },
      };

      // Specify the ending point and point interval for the normal mode (since
      // our resource is a CellML file).

      if (this.mode === 0) {
        request.json_config["simulation"] = {
          "Ending point": 3,
          "Point interval": 0.001,
        };
      }

      // Apply a stellate/vagal stimulation, if needed.
      // Notes:
      //  - this.simulationMode:
      //     - 0: normal sinus rhythm;
      //     - 1: stellate stimulation; and
      //     - 2: vagal stimulation.
      //  - this.stimulationLevel has a value in [0; 10], but to compute ACh, we
      //    need a value in [0; 1].

      if (this.simulationMode !== 0) {
        request.json_config["parameters"] = {
          "Rate_modulation_experiments/Iso_1_uM": 1.0,
          "Rate_modulation_experiments/ACh": this.simulationMode === 1 ? (1.0 - 0.1 * this.stimulationLevel) * 22.0e-6 : 22.0e-6 + 0.1 * this.stimulationLevel * (38.0e-6 - 22.0e-6),
        };
      }

      // Apply the spike settings, if needed.

      if (this.mode === 1) {
        request.json_config["parameters"] = {
          "Brain_stem/t_period": this.simulationSpikeFrequency,
          "Brain_stem/w_n": this.simulationSpikeNumber,
          "Brain_stem/w_value": 0.01 * this.simulationSpikeAmplitude,
        };
      }

      // Request the spikes if we are in composite mode.

      if (this.mode === 1) {
        request.json_config["output"].push("Brain_stem/w");
      }

      // Run the simulation.

      var xmlhttp = new XMLHttpRequest();

      xmlhttp.open("POST", this.apiLocation + "/simulation", true);
      xmlhttp.setRequestHeader("Content-type", "application/json");
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4) {
          this.simulationBeingComputed = false;

          if (xmlhttp.status === 200) {
            var response = JSON.parse(xmlhttp.responseText);

            this.simulationValid = response.status === "ok";

            if (this.simulationValid) {
              // Retrieve the spike data, if needed. (Our default spike
              // amplitude is 0.1, but we normalise it to 10.)

              if (this.mode === 1) {
                this.simulationSpikeData = [
                  {
                    x: response.results["environment/time"],
                    y: response.results["Brain_stem/w"].map(function (element) {
                      return 100 * element;
                    }),
                  },
                ];
              }

              // Retrieve the potential data.

              this.simulationPotentialData = [
                {
                  x: response.results["environment/time"],
                  y: response.results["Membrane/V"],
                },
              ];
            } else {
              this.errorMessage = response.description;
            }
          } else {
            this.simulationValid = false;

            this.errorMessage = xmlhttp.statusText.toLowerCase() + " (<a href='https://httpstatuses.com/" + xmlhttp.status + "/' target='_blank'>" + xmlhttp.status + "</a>)";
          }
        }
      };
      xmlhttp.send(JSON.stringify(request));
    },
  },
  mounted: function () {
    // Determine the mode in which we should run:
    //  - -1: unknown mode;
    //  -  0: normal mode; and
    //  -  1: composite mode.

    if (this.entry.resource === "https://models.physiomeproject.org/workspace/486/rawfile/55879cbc485e2d4c41f3dc6d60424b849f94c4ee/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml") {
      this.mode = 0;
    } else if (this.entry.resource === "https://models.physiomeproject.org/workspace/698/rawfile/f3fc911063ac72ed44e84c0c5af28df41c25d452/fabbri_et_al_based_composite_SAN_model.sedml") {
      this.mode = 1;
    } else {
      this.mode = -1;
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url("//unpkg.com/element-ui@2.14.1/lib/theme-chalk/index.css");
>>> .el-aside {
  padding: 12px 20px 12px 12px;
}
>>> .el-button:hover {
  box-shadow: -3px 2px 4px #00000040;
}
>>> .el-container.main {
  height: 100%;
}
>>> .el-input-number {
  top: -12px;
  padding-left: 132px;
}
>>> .el-input-number .el-input {
  width: 60px;
}
>>> .el-input-number .el-input__inner:focus {
  border-color: #8300bf;
}
>>> .el-main {
  margin: -16px 0 8px 0px;
}
>>> .el-slider {
  position: absolute;
  width: 108px;
  top: -16px;
  left: 8px;
  margin-bottom: 32px;
}
>>> .el-slider__bar {
  background-color: #8300bf;
}
>>> .el-slider__button {
  border-color: #8300bf;
}
.simulation-mode {
  margin-left: 8px;
}
.simulation-mode >>> .el-input__inner {
  font-family: Asap, sans-serif;
}
.simulation-mode >>> .el-input__inner:focus,
.simulation-mode >>> .el-input.is-focus .el-input__inner {
  border-color: #8300bf;
}
.simulation-mode-popper .el-select-dropdown__item {
  font-family: Asap, sans-serif;
}
.simulation-mode-popper .el-select-dropdown__item.selected {
  font-weight: normal;
  color: #8300bf;
}
div.plot-vuer {
  width: 100%;
}
div.primary-button,
div.secondary-button {
  display: flex;
  justify-content: flex-end;
}
div.primary-button {
  margin-top: 48px;
}
div.secondary-button {
  margin-top: 8px;
}
div.primary-button .el-button,
div.secondary-button .el-button,
div.primary-button .el-button:hover,
div.secondary-button .el-button:hover {
  width: 121px;
  border-color: #8300bf;
}
div.primary-button .el-button,
div.primary-button .el-button:hover {
  background-color: #8300bf;
}
div.secondary-button .el-button,
div.secondary-button .el-button:hover {
  background-color: #f9f2fc;
  color: #8300bf;
}
div.spike-frequency {
  position: absolute;
  margin-top: 4px;
}
div.spike-number {
  position: absolute;
  margin-top: 4px;
}
div.spike-amplitude {
  position: absolute;
  margin-top: 4px;
}
div.stimulation-level {
  position: absolute;
  margin-top: 4px;
}
div.simulation-vuer {
  height: 100%;
}
p.default {
  font-family: Asap, sans-serif;
  letter-spacing: 0;
  margin: 16px 0;
  text-align: start;
}
p.description {
  margin-top: -8px;
  font-size: 12px;
  line-height: 16px;
}
p.error {
  margin-left: 16px;
}
p.name,
p.input-parameters {
  margin-top: 0;
  font-weight: 500 /* Medium */;
}
p.name {
  line-height: 20px;
}
p.simulation-mode {
  margin-bottom: 4px;
}
p.spike-frequency {
  margin-bottom: 8px;
}
p.spike-number {
  margin-top: 40px;
  margin-bottom: 8px;
}
p.spike-amplitude {
  margin-top: 40px;
  margin-bottom: 8px;
}
p.stimulation-level {
  margin-bottom: 8px;
}
span.error {
  font-weight: 500 /* Medium */;
}
</style>
<style scoped src="../styles/purple/aside.css">
</style>
<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/container.css">
</style>
<style scoped src="../styles/purple/input-number.css">
</style>
<style scoped src="../styles/purple/option.css">
</style>
<style scoped src="../styles/purple/select.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
