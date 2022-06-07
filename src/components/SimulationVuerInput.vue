<template>
  <div>
    <p :class="labelClasses">{{ name }}</p>
    <el-select class="discrete" popper-class="discrete-popper" size="mini" v-if="isDiscrete" v-model="vModel" :disabled="!enabled" :popper-append-to-body="false" @change="updateUi()">
      <el-option v-for="possibleValue in possibleValues" :key="possibleValue.value" :label="possibleValue.name" :value="possibleValue.value" />
    </el-select>
    <div class="sliders-and-fields" v-if="!isDiscrete">
      <el-slider v-model="vModel" :disabled="!enabled" :max="maximumValue" :min="minimumValue" :show-input="false" :show-tooltip="false" @change="updateUi()" />
      <el-input-number class="scalar" size="mini" v-model="vModel" :controls="false" :disabled="!enabled" :max="maximumValue" :min="minimumValue" @input="updateUi()" />
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { InputNumber, Option, Select, Slider } from "element-ui";
import { updateUi } from "./ui.js";

Vue.use(InputNumber);
Vue.use(Option);
Vue.use(Select);
Vue.use(Slider);

export default {
  name: "SimulationVuerInput",
  props: {
    defaultValue: {
      required: true,
      type: Number,
    },
    firstScalarInput: {
      type: Boolean,
    },
    maximumValue: {
      type: Number,
    },
    minimumValue: {
      type: Number,
    },
    name: {
      required: true,
      type: String,
    },
    possibleValues: {
      type: Array,
    },
  },
  data: function() {
    return {
      enabled: true,
      isDiscrete: this.possibleValues !== undefined,
      labelClasses: "default " + ((this.possibleValues !== undefined)?"discrete":this.firstScalarInput?"first-scalar":"scalar"),
      vModel: this.defaultValue,
    };
  },
  methods: {
    updateUi: function() {
      updateUi(this.$parent);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
>>> .el-input-number.scalar {
  margin-top: -8px;
  width: 0;
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
.scalar >>> .el-input__inner {
  text-align: center;
}
div.simulation-vuer {
  height: 100%;
}
div.sliders-and-fields {
  display: grid;
  grid-template-columns: 132px auto;
  width: 191px;
  height: 26px;
}
p.default {
  font-family: Asap, sans-serif;
  letter-spacing: 0;
  margin: 16px 0;
  text-align: start;
}
p.first-scalar,
p.scalar {
  grid-column-start: 1;
  grid-column-end: 3;
  margin-bottom: 8px;
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
</style>
<style scoped src="../styles/purple/input-number.css">
</style>
<style scoped src="../styles/purple/option.css">
</style>
<style scoped src="../styles/purple/select.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
