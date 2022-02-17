<template>
  <div class="simulation-vuer" v-loading="simulationBeingComputed" :element-loading-text="simulationBeingComputedLabel">
    <p v-if="!hasValidJson" class="default error"><span class="error">Error:</span> an unknown or invalid model was provided.</p>
    <div class="main" v-if="hasValidJson">
      <div class="main-left">
        <p class="default title">{{title}}</p>
        <el-divider></el-divider>
        <p class="default input-parameters">Input parameters</p>
        <div ref="input">
        </div>
        <div v-if="mode === 0">
          <p class="default discrete">Simulation mode</p>
          <el-select class="discrete" popper-class="discrete-popper" :popper-append-to-body="false" v-model="simulationMode" size="mini" @change="simulationModeChanged()">
            <el-option v-for="simulationMode in simulationModes" :key="simulationMode.value" :label="simulationMode.name" :value="simulationMode.value" />
          </el-select>
          <div class="sliders-and-fields">
            <p class="default first-scalar">Stimulation level</p>
            <el-slider v-model="stimulationLevel" :max="10" :show-tooltip="false" :show-input="false" :disabled="simulationMode == 0" />
            <el-input-number class="scalar" v-model="stimulationLevel" size="mini" :controls="false" :min="0" :max="10" :disabled="simulationMode == 0" />
          </div>
        </div>
        <div v-if="mode === 1">
          <div class="sliders-and-fields">
            <p class="default first-scalar">Spike frequency</p>
            <el-slider v-model="simulationSpikeFrequency" :max="1000" :show-tooltip="false" :show-input="false" />
            <el-input-number class="scalar" v-model="simulationSpikeFrequency" size="mini" :controls="false" :min="0" :max="1000" />
            <p class="default scalar">Spike number</p>
            <el-slider v-model="simulationSpikeNumber" :max="30" :show-tooltip="false" :show-input="false" />
            <el-input-number class="scalar" v-model="simulationSpikeNumber" size="mini" :controls="false" :min="0" :max="30" />
            <p class="default scalar">Spike amplitude</p>
            <el-slider v-model="simulationSpikeAmplitude" :max="30" :show-tooltip="false" :show-input="false" />
            <el-input-number class="scalar" v-model="simulationSpikeAmplitude" size="mini" :controls="false" :min="0" :max="30" />
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
        <p class="default note">{{note}}</p>
      </div>
      <div class="main-right" v-if="mode === 0" v-show="simulationValid">
        <PlotVuer :layout-input="simulationPotentialLayout" :dataInput="simulationPotentialData" :plotType="'plotly-only'" />
      </div>
      <div class="main-right composite" v-if="mode === 1" v-show="simulationValid">
        <PlotVuer :layout-input="simulationSpikeLayout" :dataInput="simulationSpikeData" :plotType="'plotly-only'" />
        <PlotVuer :layout-input="simulationPotentialLayout" :dataInput="simulationPotentialData" :plotType="'plotly-only'" />
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

let NoSimulationData = [{}];

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
      discreteElements: [{}],
      scalarElements: [{}],
      errorMessage: "",
      note: "Additional parameters are available on oSPARC",
      stimulationLevel: 0,
      simulationMode: 0,
      simulationModes: [
        {
          name: "Normal sinus rhythm",
          value: 0,
        },
        {
          name: "Stellate stimulation",
          value: 1,
        },
        {
          name: "Vagal stimulation",
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
      title: (this.entry !== undefined)?this.entry.name:"",
    };
  },
  methods: {
    validJson() {
      // Make sure that we have some JSON data.

      if (Object.keys(this.json).length === 0) {
        return false;
      }

      // Check each input.

      return this.json.input.every((input) => {
        // Check that the input has a valid name.

        if ((typeof input.name !== "string") || (input.name === "")) {
          return false;
        }

        // Check whether the input is discrete or a scalar.

        if ((typeof input.defaultValue === "number")
            && (typeof input.possibleValues === "object")) {
          // We are dealing with a discrete input, so make sure that its data is
          // sound.

          if (!input.possibleValues.every((value) => {
            if ((typeof value !== "object")
                || (typeof value.name !== "string")
                || (typeof value.value !== "number")) {
              return false;
            }

            return true;
          })) {
            return false;
          }

          const values = input.possibleValues.map((value) => {
            return value.value;
          });

          let valueUsed = [];

          if (!values.every((value) => {
            if (valueUsed[value]) {
              return false;
            }

            valueUsed[value] = true;

            return true;
          })) {
            return false;
          }

          if (!values.includes(input.defaultValue)) {
            return false;
          }
        } else if ((typeof input.defaultValue === "number")
                   && (typeof input.minimumValue === "number")
                   && (typeof input.maximumValue === "number")) {
          // We are dealing with a scalar input, so make sure that its data is
          // sound.

          if ((input.defaultValue < input.minimumValue)
              || (input.defaultValue > input.maximumValue)
              || (input.minimumValue >= input.maximumValue)) {
            return false;
          }
        } else {
          // Not something that we support.

          return false;
        }

        return true;
      });
    },
    setVueAttributes(element) {
      this.$refs.input.attributes.forEach((attribute) => {
        element.setAttribute(attribute.nodeName, attribute.nodeValue);
      });

      element.children.forEach((childElement) => {
        this.setVueAttributes(childElement);
      });
    },
    mountAndSetVueAttributes(element) {
      element.$mount();

      this.setVueAttributes(element.$el);
    },
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
    selectionChanged: function(index, value) {
      // Some information about the select which selection has changed.

      console.log("---[el-select #" + index + "]---");
      console.log("Value: " + value);
      console.log("Id: " + this.discreteElements[index].id);
    },
    synchroniseSliderAndInputNumber: function(index, value) {
      // Make sure that both a slider and its corresponding input number have
      // the same value.

      this.scalarElements[index].slider.vModel = value;
      this.scalarElements[index].input_number.vModel = value;
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
        request.json_config.simulation = {};

        if (this.json.simulation.endingPoint !== undefined) {
          request.json_config.simulation["Ending point"] = this.json.simulation.endingPoint;
        }

        if (this.json.simulation.pointInterval !== undefined) {
          request.json_config.simulation["Point interval"] = this.json.simulation.pointInterval;
        }
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
        request.json_config.parameters = {
          "Rate_modulation_experiments/Iso_1_uM": 1.0,
          "Rate_modulation_experiments/ACh": this.simulationMode === 1 ? (1.0 - 0.1 * this.stimulationLevel) * 22.0e-6 : 22.0e-6 + 0.1 * this.stimulationLevel * (38.0e-6 - 22.0e-6),
        };
      }

      // Apply the spike settings, if needed.

      if (this.mode === 1) {
        request.json_config.parameters = {
          "Brain_stem/t_period": this.simulationSpikeFrequency,
          "Brain_stem/w_n": this.simulationSpikeNumber,
          "Brain_stem/w_value": 0.01 * this.simulationSpikeAmplitude,
        };
      }

      // Specify what we want to retrieve.

      if (this.json.output !== undefined)  {
        request.json_config.output = this.json.output;
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
              // Retrieve the spike data, if needed. (Our default spike
              // amplitude is 0.1, but we normalise it to 10.)

              if (this.mode === 1) {
                this.simulationSpikeData = [
                  {
                    x: response.results["environment/time"],
                    y: response.results["Brain_stem/w"].map((element) => {
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
  mounted: function() {
    // Manually (for now) specify the JSON configuration to be used by either
    // the normal model or the composite model.

    this.mode = -1;

    if (this.entry !== undefined) {
      if (this.entry.resource === "https://models.physiomeproject.org/workspace/486/rawfile/55879cbc485e2d4c41f3dc6d60424b849f94c4ee/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml") {
        this.mode = 0;
        this.json = {
          simulation: {
            endingPoint: 3.0,
            pointInterval: 0.001,
          },
          input: [
            {
              id: "sm",
              name: "Simulation mode",
              defaultValue: 0,
              possibleValues: [
                {
                  name: "Normal sinus rhythm",
                  value: 0,
                },
                {
                  name: "Stellate stimulation",
                  value: 1,
                },
                {
                  name: "Vagal stimulation",
                  value: 2,
                },
              ],
            },
            {
              name: "Stimulation level",
              defaultValue: 0,
              minimumValue: 0,
              maximumValue: 10,
              enabled: "(sm == 1) || (sm == 2)",
            },
          ],
          output: [
            "Membrane/V",
          ],
        };
      } else if (this.entry.resource === "https://models.physiomeproject.org/workspace/698/rawfile/f3fc911063ac72ed44e84c0c5af28df41c25d452/fabbri_et_al_based_composite_SAN_model.sedml") {
        this.mode = 1;
        this.json = {
          input: [
            {
              name: "Spike frequency",
              defaultValue: 300,
              minimumValue: 0,
              maximumValue: 1000,
            },
            {
              name: "Spike number",
              defaultValue: 10,
              minimumValue: 0,
              maximumValue: 30,
            },
            {
              name: "Spike amplitude",
              defaultValue: 10,
              minimumValue: 0,
              maximumValue: 30,
            },
          ],
          output: [
            "Membrane/V",
            "Brain_stem/w",
          ],
        };
      }
    }

    // Make sure that the JSON configuration is valid.

    this.hasValidJson = this.validJson();

    if (!this.hasValidJson) {
      return;
    }

    // Add input components, i.e. a label plus either a drop-down list (for a
    // discrete input) or a slider and a text box (for a scalar input).
    // Note: we do this using $nextTick() to guarantee that all child components
    //       have been mounted.

    this.$nextTick(() => {
      const VueLabel = Vue.extend({
        props: {
          classes: String,
          label: String,
        },
        template: `
          <p :class="classes">{{ label }}</p>
        `,
      });
      const VueContainer = Vue.extend({
        template: `
          <div class="sliders-and-fields"/>
        `,
      });
      const VueSelect = Vue.extend({
        methods: {
          emitSelectionChanged: function(value) {
            this.$emit("selectionChanged", this.index, value);
          }
        },
        props: {
          index: Number,
          possibleValues: Array,
          vModel: Number,
        },
        template: `
          <el-select class="discrete" popper-class="discrete-popper" size="mini" v-model="vModel" :popper-append-to-body="false" @change="emitSelectionChanged">
            <el-option v-for="possibleValue in possibleValues" :key="possibleValue.value" :label="possibleValue.name" :value="possibleValue.value" />
          </el-select>
        `,
      });
      const VueSlider = Vue.extend({
        methods: {
          emitSynchroniseSliderAndInputNumber: function(value) {
            this.$emit("synchroniseSliderAndInputNumber", this.index, value);
          }
        },
        props: {
          disabled: Boolean,
          index: Number,
          maximumValue: Number,
          vModel: Number,
        },
        template: `
          <el-slider v-model="vModel" :disabled="disabled" :max="maximumValue" :show-input="false" :show-tooltip="false" @input="emitSynchroniseSliderAndInputNumber" />
        `,
      });
      const VueInputNumber = Vue.extend({
        methods: {
          emitSynchroniseSliderAndInputNumber: function(value) {
            this.$emit("synchroniseSliderAndInputNumber", this.index, value);
          }
        },
        props: {
          disabled: Boolean,
          index: Number,
          maximumValue: Number,
          minimumValue: Number,
          vModel: Number,
        },
        template: `
          <el-input-number class="scalar" size="mini" v-model="vModel" :controls="false" :disabled="disabled" :max="maximumValue" :min="minimumValue" @change="emitSynchroniseSliderAndInputNumber" />
        `,
      });

      let isPreviousDiscrete = true;
      let slidersAndFieldsContainer = undefined;
      let firstScalarInput = true;
      let index = -1;

      this.json.input.forEach((input) => {
        // // Index for the new input.

        ++index;

        // Determine whether we are dealing with a discrete or a scalar input.

        let isDiscrete = input.possibleValues !== undefined;

        // Determine our element mode and create a container for our sliders and
        // input numbers, if needed.

        if (!isDiscrete && isPreviousDiscrete) {
          slidersAndFieldsContainer = new VueContainer();

          this.mountAndSetVueAttributes(slidersAndFieldsContainer);

          this.$refs.input.appendChild(slidersAndFieldsContainer.$el);
        }

        isPreviousDiscrete = isDiscrete;

        // Add the Label.

        let label = new VueLabel({
          propsData: {
            classes: "default " + (isDiscrete?"discrete":firstScalarInput?"first-scalar":"scalar"),
            label: input.name,
          }
        });

        this.mountAndSetVueAttributes(label);

        if (!isDiscrete) {
          firstScalarInput = false;
        }

        let labelParent = isDiscrete?
                            this.$refs.input:
                            slidersAndFieldsContainer.$el;

        labelParent.appendChild(label.$el);

        // Add a drop-down list or a slider and a text box depending on whether
        // we are dealing with a discrete or a scalar input.

        if (isDiscrete) {
          // Add the drop-down list.

          let select = new VueSelect({
            propsData: {
              index: index,
              possibleValues: input.possibleValues,
              vModel: input.defaultValue,
            },
          });

          this.mountAndSetVueAttributes(select);

          select.$on("selectionChanged", this.selectionChanged);

          this.$refs.input.appendChild(select.$el);

          // Keep track of the select and its id.

          this.discreteElements[index] = {
            select: select,
            id: input.id,
          };
        } else {
          // Add the slider and input number.

          let slider = new VueSlider({
            propsData: {
              disabled: false, //---GRY--- TO BE UPDATED!
              index: index,
              maximumValue: input.maximumValue,
              vModel: input.defaultValue,
            },
          });
          let inputNumber = new VueInputNumber({
            propsData: {
              disabled: false, //---GRY--- TO BE UPDATED!
              index: index,
              maximumValue: input.maximumValue,
              minimumValue: input.minimumValue,
              vModel: input.defaultValue,
            },
          });

          this.mountAndSetVueAttributes(slider);
          this.mountAndSetVueAttributes(inputNumber);

          slider.$on("synchroniseSliderAndInputNumber", this.synchroniseSliderAndInputNumber);
          inputNumber.$on("synchroniseSliderAndInputNumber", this.synchroniseSliderAndInputNumber);

          slidersAndFieldsContainer.$el.appendChild(slider.$el);
          slidersAndFieldsContainer.$el.appendChild(inputNumber.$el);

          // Keep track of the slider and input number.

          this.scalarElements[index] = {
            slider: slider,
            input_number: inputNumber,
          };
        }
      });
    });
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
div.main-right.composite {
  height: 50%;
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
