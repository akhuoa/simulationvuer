<template>
  <div id="app">
    <h1>SimulationVuer</h1>
    <p>
      This vuer demonstrates the simulation of the <a :href="workspaceUrl">Fabbri <em>et al.</em> (2017)</a> model.
    </p>
    <hr />
    <SimulationVuer :modelUrl="modelUrl()" />
  </div>
</template>

<script>
import SimulationVuer from "./components/SimulationVuer.vue";

export default {
  name: "App",
  components: {
    SimulationVuer,
  },
  data: function () {
    return {
      workspaceUrl: "https://models.physiomeproject.org/e/568",
      cellmlFileName: "HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml",
    };
  },
  methods: {
    modelUrl() {
      return this.workspaceUrl + "/" + this.cellmlFileName;
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
</style>
