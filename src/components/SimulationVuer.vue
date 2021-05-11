<template>
  <div class="simulation-vuer">
    <el-container class="main">
      <el-aside width="212px">
        <p class="default input-parameters">Input parameters</p>
        <p class="default simulation-mode">Simulation mode</p>
        <el-select class="mode" popper-class="mode-popper" :popper-append-to-body="false" v-model="mode" size="mini" @change="modeChanged()">
          <el-option v-for="mode in modes" :key="mode.value" :label="mode.label" :value="mode.value" />
        </el-select>
        <p class="default simulation-level">Stimulation level</p>
        <div class="slider">
          <el-slider v-model="level" :max="10" :show-tooltip="false" :show-input="false" :disabled="mode == 0" />
          <el-input-number v-model="level" size="mini" :controls="false" :min="0" :max="10" :disabled="mode == 0" />
        </div>
        <div class="run-simulation">
          <el-button type="primary" size="mini" @click="runSimulation()">Run simulation</el-button>
        </div>
        <div class="run-on-osparc">
          <el-button size="mini" @click="goToOsparc()">Run on oSPARC</el-button>
        </div>
      </el-aside>
      <el-container class="plot-vuer">
        <Running :active.sync="runningActive" :is-full-page="runningFullPage" :color="runningColor" />
        <PlotVuer v-show="simulationValid" class="plot-vuer" :dataInput="data" :plotType="'plotly-only'" />
        <p v-show="!simulationValid" class="default error"><span class="error">Error:</span> <span v-html="errorMessage"></span>.</p>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Vue from "vue";
import Running from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import { PlotVuer } from "@abi-software/plotvuer";
import "@abi-software/plotvuer/dist/plotvuer.css";
import { Aside, Button, Container, InputNumber, Main, Option, Select, Slider } from "element-ui";

var NoData = [{}];

Vue.use(Aside);
Vue.use(Button);
Vue.use(Container);
Vue.use(InputNumber);
Vue.use(Main);
Vue.use(Option);
Vue.use(Select);
Vue.use(Slider);

export default {
  name: "SimulationVuer",
  components: {
    PlotVuer,
    Running,
  },
  props: {
    apiLocation: {
      type: String,
      default: "",
    },
  },
  data: function () {
    return {
      errorMessage: "",
      level: 0,
      mode: 0,
      modes: [
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
      data: NoData,
      runningActive: false,
      runningColor: "#8300bf",
      runningFullPage: false,
      simulationValid: true,
    };
  },
  methods: {
    goToOsparc() {
      window.open("https://osparc.io/", "_blank");
    },
    modeChanged() {
      this.data = NoData;
      this.simulationValid = true;
    },
    runSimulation() {
      this.runningActive = true;

      var model_url = "https://models.physiomeproject.org/e/611/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml";
      var json_config = {
        simulation: {
          "Ending point": 3,
          "Point interval": 0.001,
        },
        output: ["Membrane/V"],
      };

      if (this.mode !== 0) {
        // Mode 1: stellate stimulation.
        // Mode 2: vagal stimulation.

        json_config["parameters"] = {
          "Rate_modulation_experiments/Iso_1_uM": 1.0,
          "Rate_modulation_experiments/ACh": this.mode === 1 ? (1.0 - 0.1 * this.level) * 22.0e-6 : 22.0e-6 + 0.1 * this.level * (38.0e-6 - 22.0e-6),
        };
      }

      fetch(this.apiLocation + "/simulation?model_url=" + encodeURIComponent(model_url) + "&json_config=" + encodeURIComponent(JSON.stringify(json_config)))
        .then((response) => {
          if (!response.ok) {
            this.runningActive = false;
            this.simulationValid = false;
            this.errorMessage = response.statusText.toLowerCase() + " (<a href='https://httpstatuses.com/" + response.status + "/' target='_blank'>" + response.status + "</a>)";

            return;
          }

          return response.json();
        })
        .then((data) => {
          this.runningActive = false;
          this.simulationValid = data.status == "ok";

          if (this.simulationValid) {
            this.data = [
              {
                x: data.results["environment/time"],
                y: data.results["Membrane/V"],
              },
            ];
          } else {
            this.errorMessage = data.description;
          }
        });
    },
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
>>> .el-container.plot-vuer {
  border: solid #dcdfe6;
  border-width: 0 0 0 1px;
}
>>> .el-input-number {
  top: -12px;
  padding-left: 132px;
}
>>> .el-input-number .el-input {
  width: 48px;
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
.mode {
  margin-left: 8px;
}
.mode >>> .el-input__inner {
  font-family: Asap, sans-serif;
}
.mode >>> .el-input__inner:focus,
.mode >>> .el-input.is-focus .el-input__inner {
  border-color: #8300bf;
}
.mode-popper .el-select-dropdown__item {
  font-family: Asap, sans-serif;
}
.mode-popper .el-select-dropdown__item.selected {
  font-weight: normal;
  color: #8300bf;
}
div.plot-vuer {
  width: 100%;
}
div.run-simulation,
div.run-on-osparc {
  display: flex;
  justify-content: flex-end;
}
div.run-simulation {
  margin-top: 48px;
}
div.run-on-osparc {
  margin-top: 8px;
}
div.run-simulation .el-button,
div.run-on-osparc .el-button,
div.run-simulation .el-button:hover,
div.run-on-osparc .el-button:hover {
  width: 121px;
  border-color: #8300bf;
}
div.run-simulation .el-button,
div.run-simulation .el-button:hover {
  background-color: #8300bf;
}
div.run-on-osparc .el-button,
div.run-on-osparc .el-button:hover {
  background-color: #f9f2fc;
  color: #8300bf;
}
div.simulation-vuer {
  height: 100%;
}
div.slider {
  position: absolute;
  margin-top: 4px;
}
p.default {
  font-family: Asap, sans-serif;
  letter-spacing: 0;
  margin: 16px 0;
  text-align: start;
}
p.error {
  margin-left: 16px;
}
p.input-parameters {
  margin-top: 0;
  font-weight: 500 /* Medium */;
}
p.simulation-mode {
  margin-bottom: 4px;
}
p.simulation-level {
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
