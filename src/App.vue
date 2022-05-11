<template>
  <div id="app">
    <div class="app">
      <h1>SimulationVuer</h1>
    </div>
    <hr />
    <p>
      Instance for an unknown or invalid model:
    </p>
    <SimulationVuer :apiLocation="apiLocation" :id=0 />
    <hr />
    <p>
      Instance showing the simulation of the <a href="https://models.physiomeproject.org/e/611/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml/view">Fabbri <em>et al.</em> (2017)</a> model:
    </p>
    <SimulationVuer :apiLocation="apiLocation" :id=135 />
    <hr />
    <p>
      Instance showing the simulation of the <a href="https://models.physiomeproject.org/e/611/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml/view">Fabbri <em>et al.</em> (2017)</a> + <a href="https://models.physiomeproject.org/workspace/694">Gerstner & Kistler (2002)</a> composite model:
    </p>
    <SimulationVuer :apiLocation="apiLocation" :id=157 />
    <hr />
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
