<template>
  <div class="simulation-container">
    <el-container class="main-el-container">
      <el-aside width="212px">
        <p class="input-parameters">Input parameters</p>
        <p class="simulation-mode">Simulation mode</p>
        <el-select v-model="mode" size="mini" @change="modeChanged()">
          <el-option v-for="mode in modes" :key="mode.value" :label="mode.label" :value="mode.value" />
        </el-select>
        <p class="simulation-level">Stimulation level</p>
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
      <el-container class="plot-vuer-container">
        <Running :active.sync="runningActive" :is-full-page="runningFullPage" :color="runningColor" />
        <PlotVuer class="plot-vuer" :dataInput="data" :plotType="'plotly-only'" />
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
import SinusData from "@/../data/sinus.json";
import Stellate_0_0_Data from "@/../data/stellate_0.0.json";
import Stellate_0_1_Data from "@/../data/stellate_0.1.json";
import Stellate_0_2_Data from "@/../data/stellate_0.2.json";
import Stellate_0_3_Data from "@/../data/stellate_0.3.json";
import Stellate_0_4_Data from "@/../data/stellate_0.4.json";
import Stellate_0_5_Data from "@/../data/stellate_0.5.json";
import Stellate_0_6_Data from "@/../data/stellate_0.6.json";
import Stellate_0_7_Data from "@/../data/stellate_0.7.json";
import Stellate_0_8_Data from "@/../data/stellate_0.8.json";
import Stellate_0_9_Data from "@/../data/stellate_0.9.json";
import Stellate_1_0_Data from "@/../data/stellate_1.0.json";
import Vagal_0_0_Data from "@/../data/vagal_0.0.json";
import Vagal_0_1_Data from "@/../data/vagal_0.1.json";
import Vagal_0_2_Data from "@/../data/vagal_0.2.json";
import Vagal_0_3_Data from "@/../data/vagal_0.3.json";
import Vagal_0_4_Data from "@/../data/vagal_0.4.json";
import Vagal_0_5_Data from "@/../data/vagal_0.5.json";
import Vagal_0_6_Data from "@/../data/vagal_0.6.json";
import Vagal_0_7_Data from "@/../data/vagal_0.7.json";
import Vagal_0_8_Data from "@/../data/vagal_0.8.json";
import Vagal_0_9_Data from "@/../data/vagal_0.9.json";
import Vagal_1_0_Data from "@/../data/vagal_1.0.json";

var StellateData = [Stellate_0_0_Data, Stellate_0_1_Data, Stellate_0_2_Data, Stellate_0_3_Data, Stellate_0_4_Data, Stellate_0_5_Data, Stellate_0_6_Data, Stellate_0_7_Data, Stellate_0_8_Data, Stellate_0_9_Data, Stellate_1_0_Data];
var VagalData = [Vagal_0_0_Data, Vagal_0_1_Data, Vagal_0_2_Data, Vagal_0_3_Data, Vagal_0_4_Data, Vagal_0_5_Data, Vagal_0_6_Data, Vagal_0_7_Data, Vagal_0_8_Data, Vagal_0_9_Data, Vagal_1_0_Data];
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
  data: function () {
    return {
      level: 0,
      runningActive: false,
      runningColor: "#8300bf",
      runningFullPage: false,
      runningTimeout: 789,
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
    };
  },
  methods: {
    goToOsparc() {
      window.open("https://osparc.io/", "_blank");
    },
    modeChanged() {
      this.data = NoData;
    },
    runSimulation() {
      this.runningActive = true;

      setTimeout(() => {
        this.runningActive = false;

        switch (this.mode) {
          case 1: // Stellate stimulation.
            this.data = StellateData[this.level];

            break;
          case 2: // Vagal stimulation.
            this.data = VagalData[this.level];

            break;
          default:
            // Normal sinus rhythm.
            this.data = SinusData;
        }
      }, this.runningTimeout);
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
>>> .el-select {
  margin-left: 8px;
}
>>> .el-select .el-input__inner:focus,
>>> .el-select .el-input.is-focus .el-input__inner {
  border-color: #8300bf;
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
.el-button:hover {
    box-shadow: -3px 2px 4px #00000040;
}
.el-select-dropdown__item {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
.main-el-container {
  height: 100%;
}
.plot-vuer {
  width: 100%;
}
.plot-vuer-container {
  border: solid #dcdfe6;
  border-width: 0 0 0 1px;
}
.simulation-mode {
  margin-bottom: 4px;
}
.simulation-level {
  margin-bottom: 8px;
}
div.slider {
  position: absolute;
  margin-top: 4px;
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
div.run-on-osparc .el-button {
  width: 121px;
}
div.run-simulation .el-button {
  background-color: #8300bf;
  border-color: #8300bf;
}
div.run-on-osparc .el-button {
  background-color: #f9f2fc;
  color: #8300bf;
  border-color: #8300bf;
}
div.simulation-container {
  height: 100%;
}
p.input-parameters {
  font-weight: medium;
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
