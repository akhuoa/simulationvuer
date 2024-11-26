<template>
  <div id="app">
    <div class="app">
      <h1>SimulationVuer</h1>
      <h3>Simulations run on o²S²PARC:</h3>
      <el-radio-group v-model="id" size="small">
        <el-radio-button :class="className(dataset.id)" v-for="dataset in sparcDatasets" v-bind:key="dataset.id" :label="dataset.label" :value="dataset.id" />
      </el-radio-group>
      <h3>Simulations run in the browser:</h3>
      <el-radio-group v-model="id" size="small">
        <el-radio-button :class="className(dataset.id)" v-for="dataset in pmrDatasets" v-bind:key="dataset.id" :label="dataset.label" :value="dataset.id" />
      </el-radio-group>
    </div>
    <hr />
    <div v-for="dataset in datasets()" v-bind:key="dataset.id">
      <div v-if="initialised(dataset.id)" v-show="dataset.id == id">
        <div v-if="typeof dataset.id === 'number'">
          <span>
          <strong>Dataset <a :href="datasetUrl(dataset.id)" target="_blank">{{ dataset.id }}</a>:</strong> {{ dataset.description }}
          </span>
          <hr />
        </div>
        <SimulationVuer :apiLocation="apiLocation" :id="dataset.id" style="height: 640px;" />
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import SimulationVuer from "./components/SimulationVuer.vue";
import { ElRadioButton, ElRadioGroup } from "element-plus";

export default {
  name: "App",
  components: {
    SimulationVuer,
    ElRadioButton,
    ElRadioGroup,
  },
  data: function () {
    return {
      apiLocation: import.meta.env.VITE_API_LOCATION,
      sparcDatasets: [
        { id: 0, label: "0", description: "Non-simulation dataset" },
        { id: 135, label: "135", description: "Computational analysis of the human sinus node action potential - Model development and effects of mutations" },
        { id: 157, label: "157", description: "Fabbri-based composite SAN model" },
        { id: 308, label: "308", description: "Kember Cardiac Nerve Model" },
        { id: 318, label: "318", description: "Multi-scale rabbit cardiac electrophysiology models" },
        { id: 320, label: "320", description: "Multi-scale human cardiac electrophysiology models" },
      ],
      pmrDatasets: [
        { id: "workspace/b7c/rawfile/01e2df76bf5e8d5ad7c00c3a4e7876879259edd6/135.omex", label: "135", description: "COMBINE archive from PMR" },
        { id: "workspace/b7c/rawfile/01e2df76bf5e8d5ad7c00c3a4e7876879259edd6/157.omex", label: "157", description: "COMBINE archive from PMR" },
        { id: "workspace/b7c/rawfile/01e2df76bf5e8d5ad7c00c3a4e7876879259edd6/lorenz.omex", label: "Lorenz", description: "COMBINE archive from PMR" },
        { id: "workspace/b7c/rawfile/01e2df76bf5e8d5ad7c00c3a4e7876879259edd6/tt04.omex", label: "TT04", description: "COMBINE archive from PMR" },
        { id: "workspace/b7c/rawfile/01e2df76bf5e8d5ad7c00c3a4e7876879259edd6/Gee_whiz_Exported.cellml.omex", label: "GeeWhiz", description: "COMBINE archive from PMR" },
      ],
      id: 0,
      ready: [],
    };
  },
  methods: {
    className(id) {
      return ((id == this.sparcDatasets[0].id) || (id == this.pmrDatasets[0].id)) ? "first-dataset" : "";
    },
    datasets() {
      return this.sparcDatasets.concat(this.pmrDatasets);
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

.first-dataset>.el-radio-button__inner {
  border-left: 1px solid #8300bf !important;
}

.el-radio-button__original-radio:checked+.el-radio-button__inner {
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

h3 {
  margin-bottom: 0;
}
</style>
