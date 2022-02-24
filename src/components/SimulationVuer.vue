<template>
  <div class="simulation-vuer" v-loading="simulationBeingComputed" element-loading-text="Loading simulation results...">
    <p v-if="!hasValidJson" class="default error"><span class="error">Error:</span> an unknown or invalid model was provided.</p>
    <div class="main" v-if="hasValidJson">
      <div class="main-left">
        <p class="default title">{{title}}</p>
        <el-divider></el-divider>
        <p class="default input-parameters">Input parameters</p>
        <div ref="input" />
        <div class="primary-button">
          <el-button type="primary" size="mini" @click="runSimulation()">Run simulation</el-button>
        </div>
        <div class="secondary-button">
          <el-button size="mini" @click="goToOsparc()">Go to oSPARC</el-button>
        </div>
        <div class="secondary-button">
          <el-button size="mini" @click="viewDataset()">View dataset</el-button>
        </div>
        <p class="default note">Additional parameters are available on oSPARC</p>
      </div>
      <div class="main-right" ref="output" v-show="simulationValid">
        <PlotVuer v-for="(outputPlot, index) in json.output.plots" :key="`output-${index}`" :layout-input="layout[index]" :dataInput="simulationData[index]" :plotType="'plotly-only'" />
      </div>
      <div class="main-right" v-show="!simulationValid">
        <p class="default error"><span class="error">Error:</span> <span v-html="errorMessage"></span>.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { PlotVuer } from "@abi-software/plotvuer";
import "@abi-software/plotvuer/dist/plotvuer.css";
import { Aside, Button, Container, Divider, InputNumber, Loading, Main, Option, Select, Slider } from "element-ui";
import { jsonForNormalModel, jsonForCompositeModel } from "./configuration.js";
import { evaluateValue, evaluateSimulationValue } from "./common.js";
import { validJson } from "./json.js";
import Ui from "./ui.js";
import { prepareForUi } from "./ui.js";

Vue.use(Aside);
Vue.use(Button);
Vue.use(Container);
Vue.use(Divider);
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
      required: true,
      type: String,
    },
    entry: {
      required: true,
      type: Object,
    },
  },
  data: function() {
    return {
      mode: 0, //---GRY--- TO BE DELETED!
      json: {},
      hasValidJson: true,
      errorMessage: "",
      layout: [],
      simulationData: [],
      simulationDataId: {},
      simulationBeingComputed: false,
      simulationValid: true,
      title: (this.entry !== undefined)?this.entry.name:"",
      ui: null,
    };
  },
  methods: {
    goToOsparc() {
      window.open("https://osparc.io/", "_blank");
    },
    viewDataset() {
      window.open(this.entry.dataset, "_blank");
    },
    runSimulation() {
      this.simulationBeingComputed = true;

      let request = {
        model_url: this.entry.resource,
        json_config: {},
      };

      // Specify the ending point and point interval for the normal mode (since
      // our resource is a CellML file).

      if (this.json.simulation !== undefined) {
        request.json_config.simulation = {
          "Ending point": this.json.simulation.endingPoint,
          "Point interval": this.json.simulation.pointInterval,
        };
      }

      // Specify the simulation parameters.

      if (this.json.parameters != undefined) {
        request.json_config.parameters = {};

        this.json.parameters.forEach((parameter) => {
          request.json_config.parameters[parameter.name] = evaluateValue(this.ui, parameter.value);
        });
      }

      // Specify what we want to retrieve.

      if (this.json.output.data !== undefined)  {
        let index = -1;

        request.json_config.output = [];

        this.json.output.data.forEach((outputData) => {
          request.json_config.output[++index] = outputData.name;
        });
      }

      // Run the simulation.

      let xmlhttp = new XMLHttpRequest();

      xmlhttp.open("POST", this.apiLocation + "/simulation", true);
      xmlhttp.setRequestHeader("Content-type", "application/json");
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4) {
          this.simulationBeingComputed = false;

          if (xmlhttp.status === 200) {
            let response = JSON.parse(xmlhttp.responseText);

            this.simulationValid = response.status === "ok";

            if (this.simulationValid) {
              // Retrieve and post-process the simulation data.

              let index = -1;
              let iMax = response.results[this.simulationDataId[Object.keys(this.simulationDataId)[0]]].length;

              this.json.output.plots.forEach((outputPlot) => {
                let xValue = [];
                let yValue = [];

                for (let i = 0; i < iMax; ++i) {
                  xValue[i] = evaluateSimulationValue(this, response.results, outputPlot.xValue, i);
                  yValue[i] = evaluateSimulationValue(this, response.results, outputPlot.yValue, i);
                }

                this.simulationData[++index] = [
                  {
                    x: xValue,
                    y: yValue,
                  },
                ];
              });
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
  created: function() {
    // Manually (for now) specify the JSON configuration to be used by either
    // the normal model or the composite model.

    this.mode = -1;

    if (this.entry !== undefined) {
      if (this.entry.resource === "https://models.physiomeproject.org/workspace/486/rawfile/55879cbc485e2d4c41f3dc6d60424b849f94c4ee/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml") {
        this.mode = 0;
        this.json = jsonForNormalModel();
      } else if (this.entry.resource === "https://models.physiomeproject.org/workspace/698/rawfile/f3fc911063ac72ed44e84c0c5af28df41c25d452/fabbri_et_al_based_composite_SAN_model.sedml") {
        this.mode = 1;
        this.json = jsonForCompositeModel();
      }
    }

    // Make sure that the JSON configuration is valid.

    this.hasValidJson = validJson(this.json);

    if (!this.hasValidJson) {
      return;
    }

    // Prepare ourselves for the UI by initialising some data.

    prepareForUi(this);
  },
  mounted: function() {
    // Finish mounting by creating the UI for the given simulation dataset.

    if (this.hasValidJson) {
      this.ui = new Ui(this);
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url("//unpkg.com/element-ui@2.14.1/lib/theme-chalk/index.css");
>>> .el-button:hover {
  box-shadow: -3px 2px 4px #00000040;
}
>>> .el-divider {
  margin: -8px 0 8px 0;
  width: 191px;
}
>>> .el-input-number.scalar {
  margin-top: -8px;
  width: 0;
  height: 0;
}
>>> .el-input-number.scalar .el-input {
  width: 60px;
}
>>> .el-input-number.scalar .el-input__inner:focus {
  border-color: #8300bf;
}
>>> .el-select.discrete {
  margin-bottom: 16px;
}
>>> .el-slider {
  width: 108px;
  margin-top: -12px;
  margin-left: 8px;
}
>>> .el-slider__bar {
  background-color: #8300bf;
}
>>> .el-slider__button {
  border-color: #8300bf;
}
.discrete {
  margin-left: 8px;
}
.discrete >>> .el-input__inner {
  font-family: Asap, sans-serif;
}
.discrete >>> .el-input__inner:focus,
.discrete >>> .el-input.is-focus .el-input__inner {
  border-color: #8300bf;
}
.discrete-popper .el-select-dropdown__item {
  font-family: Asap, sans-serif;
}
.discrete-popper .el-select-dropdown__item.selected {
  font-weight: normal;
  color: #8300bf;
}
div.main {
  display: grid;
  --mainLeftWidth: 224px;
  grid-template-columns: var(--mainLeftWidth) calc(100% - var(--mainLeftWidth));
  height: 100%;
}
div.main-left {
  border-right: 1px solid #dcdfe6;
  padding: 12px 20px 12px 12px;
  height: 100%;
  overflow: auto;
}
div.main-right.x1 {
  height: 100%;
}
div.main-right.x2 {
  height: 50%;
}
div.main-right.x3 {
  height: 33.333%;
}
div.main-right.x4 {
  height: 25%;
}
div.main-right.x5 {
  height: 20%;
}
div.main-right.x6 {
  height: 16.667%;
}
div.main-right.x7 {
  height: 14.286%;
}
div.main-right.x8 {
  height: 12.5%;
}
div.main-right.x9 {
  height: 11.111%;
}
>>> div.main-right div.controls {
  height: 0;
}
div.plot-vuer {
  display: grid;
  width: 100%;
}
div.primary-button,
div.secondary-button {
  display: flex;
  justify-content: flex-end;
  width: 191px;
}
div.primary-button {
  margin-top: 14px;
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
div.simulation-vuer {
  height: 100%;
}
div.sliders-and-fields {
  display: grid;
  grid-template-columns: 132px auto;
  width: 191px;
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
p.first-scalar,
p.scalar {
  grid-column-start: 1;
  grid-column-end: 3;
  margin-bottom: 8px;
}
p.note {
  font-size: 12px;
  line-height: 16px;
}
p.title,
p.input-parameters {
  margin-top: 0;
  font-weight: 500 /* Medium */;
}
p.title {
  line-height: 20px;
}
p.discrete {
  margin-top: 0;
  margin-bottom: 4px;
}
p.first-scalar {
  margin-top: 0;
}
p.scalar {
  margin-top: 6px;
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
