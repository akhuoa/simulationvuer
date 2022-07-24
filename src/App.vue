<template>
  <div id="app">
    <div class="app">
      <h1>SimulationVuer</h1>
      <el-radio-group v-model="id" size="mini">
        <el-radio-button :class="className(dataset.id)" v-for="dataset in datasets" v-bind:key="dataset.id" :label="dataset.id" />
      </el-radio-group>
    </div>
    <hr />
    <div v-for="dataset in datasets" v-bind:key="dataset.id">
      <div v-if="initialised(dataset.id)" v-show="dataset.id == id">
        <span>
          <strong>Dataset <a :href="datasetUrl(dataset.id)" target="_blank">{{ dataset.id }}</a>:</strong> {{ dataset.description }}
        </span>
        <hr />
        <SimulationVuer :apiLocation="apiLocation" :id="dataset.id" />
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import Vue from "vue";
import SimulationVuer from "./components/SimulationVuer.vue";
import { RadioButton, RadioGroup } from "element-ui";

Vue.use(RadioButton);
Vue.use(RadioGroup);

export default {
  name: "App",
  components: {
    SimulationVuer,
  },
  data: function () {
    return {
      apiLocation: process.env.VUE_APP_API_LOCATION,
      datasets: [
        { id: 0, description: "Non-simulation dataset", },
        { id: 4, description: "Multi-scale rabbit cardiac electrophysiology models", },
        { id: 6, description: "SPARC Nerve Activity Predictor (SNAP)", },
        { id: 7, description: "Multi-scale human cardiac electrophysiology models", },
        { id: 23, description: "A multi-scale model of cardiac electrophysiology", },
        { id: 30, description: "Small Enteric Neural Network Simulator", },
        { id: 78, description: "Kember Cardiac Nerve Model", },
        { id: 135, description: "Computational analysis of the human sinus node action potential - Model development and effects of mutations", },
        { id: 157, description: "Fabbri-based composite SAN model", },
      ],
      id: 0,
      ready: [],
    };
  },
  methods: {
    className(id) {
      return (id == this.datasets[0].id)?"first-dataset":"";
    },
    datasetUrl(id) {
      return `https://sparc.science/datasets/${id}?type=dataset`;
    },
    initialised(id) {
      if (this.ready.includes(id)) {
        return true;
      }

      if (this.id == id) {
        this.ready.push(id);
      }

      return this.ready.includes(id);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.el-radio-button__inner {
  background-color: #f9f2fc;
  border-color: #8300bf;
  box-shadow: -1px 0 0 0 #8300bf !important;
  color: #8300bf;
}
.first-dataset > .el-radio-button__inner {
  border-left: 1px solid #8300bf !important;
}
.el-radio-button__orig-radio:checked+.el-radio-button__inner {
  background-color: #8300bf;
  border-color: #8300bf;
  color: white;
}
.el-radio-button__inner:hover {
  color: #8300bf;
}
a {
  color: #2c3e50;
}
div.app {
  text-align: center;
}
</style>
