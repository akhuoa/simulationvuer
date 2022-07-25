<template>
  <div class="simulation-vuer" v-loading="showUserMessage" :element-loading-text="userMessage">
    <p v-if="!hasValidSimulationUiInformation && !showUserMessage" class="default error"><span class="error">Error:</span> an unknown or invalid model was provided.</p>
    <div class="main" v-if="hasValidSimulationUiInformation">
      <div class="main-left">
        <p class="default name">{{name}}</p>
        <el-divider></el-divider>
        <p class="default input-parameters">Input parameters</p>
        <div>
          <SimulationVuerInput v-for="(input, index) in simulationUiInformation.input" :defaultValue="input.defaultValue" :firstScalarInput="firstScalarInput[index]" :key="`input-${index}`" :name="input.name" :maximumValue="input.maximumValue" :minimumValue="input.minimumValue" :possibleValues="input.possibleValues" />
        </div>
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
      <div class="main-right" ref="output" v-show="isSimulationValid">
        <PlotVuer v-for="(outputPlot, index) in simulationUiInformation.output.plots" :key="`output-${index}`" :layout-input="layout[index]" :dataInput="simulationData[index]" :plotType="'plotly-only'" />
      </div>
      <div class="main-right" v-show="!isSimulationValid">
        <p class="default error"><span class="error">Error:</span> <span v-html="errorMessage"></span>.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { PlotVuer } from "@abi-software/plotvuer";
import "@abi-software/plotvuer/dist/plotvuer.css";
import SimulationVuerInput from "./SimulationVuerInput.vue";
import { Button, Divider, Loading } from "element-ui";
import { evaluateValue, evaluateSimulationValue } from "./common.js";
import { validJson } from "./json.js";
import { initialiseUi, finaliseUi } from "./ui.js";
import datasetInfo135 from "./res/datasetInfo135.json";
import datasetInfo157 from "./res/datasetInfo157.json";

Vue.use(Button);
Vue.use(Divider);
Vue.use(Loading.directive);

export default {
  name: "SimulationVuer",
  components: {
    PlotVuer,
    SimulationVuerInput,
  },
  props: {
    apiLocation: {
      required: true,
      type: String,
    },
    id: {
      required: true,
      type: Number,
    },
  },
  data: function() {
    let xmlhttp = new XMLHttpRequest();
    let name = undefined;
    let resource = undefined;

    xmlhttp.open("GET", this.apiLocation + "/dataset_info/using_pennsieve_identifier?identifier=" + this.id, false);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();

    if (xmlhttp.status === 200) {
      let datasetInfo = JSON.parse(xmlhttp.responseText).result[0];

      if (datasetInfo !== undefined) {
        name = datasetInfo.name;

        let isSedmlResource = false;

        datasetInfo.additionalLinks.forEach(function(el) {
          if (el.description == "SED-ML file") {
            isSedmlResource = true;
            resource = el.uri;
          } else if (!isSedmlResource && (el.description == "CellML file")) {
            resource = el.uri;
          }
        });
      }
    }

    return {
      errorMessage: "",
      firstScalarInput: [],
      hasFinalisedUi: false,
      hasValidSimulationUiInformation: false,
      isMounted: false,
      isSimulationValid: true,
      layout: [],
      name: name,
      resource: resource,
      showUserMessage: false,
      simulationData: [],
      simulationDataId: {},
      simulationUiInformation: {},
      userMessage: "",
      ui: null,
    };
  },
  methods: {
    retrieveAndBuildSimulationUi(simulationUiInformation) {
      // Keep track of the simulation UI information.

      this.simulationUiInformation = simulationUiInformation;

      // Make sure that the simulation UI information is valid.

      this.hasValidSimulationUiInformation = validJson(this.simulationUiInformation);

      if (!this.hasValidSimulationUiInformation) {
        return;
      }

      // Initialise our UI.

      initialiseUi(this);

      // Finalise our UI.
      // Note: we try both here and in the mounted() function since we have no
      //       idea how long it's going to take to retrieve the simulation UI
      //       information.

      this.$nextTick(() => {
        finaliseUi(this);
      });
    },
    goToOsparc() {
      window.open("https://osparc.io/", "_blank");
    },
    viewDataset() {
      window.open(`https://sparc.science/datasets/${this.id}?type=dataset`, "_blank");
    },
    runSimulation() {
      this.userMessage = "Loading simulation results...";
      this.showUserMessage = true;

      let request = {
        model_url: this.resource,
        json_config: {},
      };

      // Specify the ending point and point interval, if we have some simulation
      // data.

      if (this.simulationUiInformation.simulation !== undefined) {
        request.json_config.simulation = {
          "Ending point": this.simulationUiInformation.simulation.endingPoint,
          "Point interval": this.simulationUiInformation.simulation.pointInterval,
        };
      }

      // Specify the simulation parameters.

      if (this.simulationUiInformation.parameters != undefined) {
        request.json_config.parameters = {};

        this.simulationUiInformation.parameters.forEach((parameter) => {
          request.json_config.parameters[parameter.name] = evaluateValue(this, parameter.value);
        });
      }

      // Specify what we want to retrieve.

      if (this.simulationUiInformation.output.data !== undefined)  {
        let index = -1;

        request.json_config.output = [];

        this.simulationUiInformation.output.data.forEach((outputData) => {
          request.json_config.output[++index] = outputData.name;
        });
      }

      // Run the simulation.

      let xmlhttp = new XMLHttpRequest();

      xmlhttp.open("POST", this.apiLocation + "/simulation", true);
      xmlhttp.setRequestHeader("Content-type", "application/json");
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4) {
          this.showUserMessage = false;

          if (xmlhttp.status === 200) {
            let response = JSON.parse(xmlhttp.responseText);

            this.isSimulationValid = response.status === "ok";

            if (this.isSimulationValid) {
              // Retrieve and post-process the simulation data.

              let index = -1;
              let iMax = response.results[this.simulationDataId[Object.keys(this.simulationDataId)[0]]].length;

              this.simulationUiInformation.output.plots.forEach((outputPlot) => {
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
            this.isSimulationValid = false;

            this.errorMessage = xmlhttp.statusText.toLowerCase() + " (<a href='https://httpstatuses.com/" + xmlhttp.status + "/' target='_blank'>" + xmlhttp.status + "</a>)";
          }
        }
      };
      xmlhttp.send(JSON.stringify(request));
    },
  },
  created: function() {
    // Try to retrieve the UI information, but only if we have a resource.

    if (this.resource !== undefined) {
      let production = false;

      this.userMessage = "Retrieving UI information...";
      this.showUserMessage = production;

      // Retrieve and build the simulation UI.

      if (production) {
        let xmlhttp = new XMLHttpRequest();

        xmlhttp.open("GET", this.apiLocation + "/simulation_ui_file/" + this.id, true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState === 4) {
            this.showUserMessage = false;

            if (xmlhttp.status === 200) {
              this.retrieveAndBuildSimulationUi(JSON.parse(xmlhttp.responseText));
            }
          }
        };
        xmlhttp.send();
      } else {
        let datasetInfos = {
          135: datasetInfo135,
          157: datasetInfo157,
        };

        this.retrieveAndBuildSimulationUi(datasetInfos[this.id]);
      }
    }
  },
  mounted: function() {
    // Finalise our UI.
    // Note: we try both here and in the created() function since we have no
    //       idea how long it's going to take to retrieve the simulation UI
    //       information.

    this.isMounted = true;

    finaliseUi(this);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/divider";
@import "~element-ui/packages/theme-chalk/src/loading";

::v-deep .el-button:hover {
  box-shadow: -3px 2px 4px #00000040;
}
::v-deep .el-divider {
  margin: -8px 0 8px 0 !important;
  width: 191px;
}
::v-deep .el-loading-spinner {
  .path {
    stroke: $app-primary-color;
  }
  i, .el-loading-text {
    color: $app-primary-color;
  }
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
::v-deep div.main-right div.controls {
  height: 0;
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
p.default {
  font-family: Asap, sans-serif;
  letter-spacing: 0;
  margin: 16px 0;
  text-align: start;
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
p.note {
  font-size: 12px;
  line-height: 16px;
}
span.error {
  font-weight: 500 /* Medium */;
}
</style>
