<template>
  <div id="app">
    <div class="app">
      <h1>SimulationVuer</h1>
      <p>
        This vuer demonstrates the simulation of the <a href="https://models.physiomeproject.org/e/611/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml/view">Fabbri <em>et al.</em> (2017)</a> model.
      </p>
    </div>
    <hr />
    <SimulationVuer :apiLocation="apiLocation" />
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
      apiLocation: process.env.VUE_APP_API_LOCATION,
    };
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
div.app {
  text-align: center;
}
</style>
