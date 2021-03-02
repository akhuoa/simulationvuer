<template>
  <div class="simulation-container">
    <el-container class="main-el-container">
      <el-aside width="220px">
        <p class="input-parameters">Input parameters</p>
        <p class="simulation-mode">Simulation mode</p>
        <el-select v-model="mode" size="mini" @change="modeChanged()">
          <el-option v-for="mode in modes" :key="mode.value" :label="mode.label" :value="mode.value" />
        </el-select>
        <p class="simulation-level">Stimulation level</p>
        <el-container>
          <el-main>
            <div class="block">
              <el-slider v-model="level" :max="10" :show-tooltip="false" :show-input="false" :format-tooltip="formatTooltip" :disabled="mode == 0" />
              <span class="level-string">{{ levelString }}</span>
            </div>
          </el-main>
        </el-container>
        <div class="button">
          <el-button type="primary" size="mini" @click="runSimulation()">Run simulation</el-button>
        </div>
        <div class="button">
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
import { Aside, Button, Container, Main, Option, Select, Slider } from "element-ui";
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
      levelString: "0%",
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
    formatTooltip(value) {
      this.levelString = 10 * value + "%";
    },
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
  width: 106px;
  top: -18px;
  left: 8px;
  margin-bottom: 32px;
}
>>> .el-slider__bar {
  background-color: #8300bf;
}
>>> .el-slider__button {
  border-color: #8300bf;
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
div.block {
  position: absolute;
  width: 160px;
  left: 32px;
}
div.button {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
div.button .el-button {
  width: 121px;
}
div.simulation-container {
  height: 100%;
}
p.input-parameters {
  font-weight: medium;
}
span.level-string {
  position: absolute;
  width: 25px;
  top: -9px;
  right: 0px;
}
</style>
<style scoped src="../styles/purple/aside.css">
</style>
<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/container.css">
</style>
<style scoped src="../styles/purple/option.css">
</style>
<style scoped src="../styles/purple/select.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
