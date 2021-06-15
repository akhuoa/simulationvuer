<template>
  <div id="app">
    <div class="app">
      <h1>SimulationVuer</h1>
    </div>
    <hr />
    <p>
      Instance for an unknown model:
    </p>
    <SimulationVuer :apiLocation="apiLocation" />
    <hr />
    <p>
      Instance showing the simulation of the <a href="https://models.physiomeproject.org/e/611/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml/view">Fabbri <em>et al.</em> (2017)</a> model:
    </p>
    <SimulationVuer :apiLocation="apiLocation" :resource="resource" />
    <hr />
    <p>
      Instance showing the simulation of the <a href="https://models.physiomeproject.org/e/611/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml/view">Fabbri <em>et al.</em> (2017)</a> + <a href="https://models.physiomeproject.org/workspace/694">Gerstner & Kistler (2002)</a> composite model:
    </p>
    <SimulationVuer :apiLocation="apiLocation" :resource="compositeResource" />
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
      resource: "https://models.physiomeproject.org/workspace/486/rawfile/55879cbc485e2d4c41f3dc6d60424b849f94c4ee/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml",
      compositeResource: "https://models.physiomeproject.org/workspace/698/rawfile/f3fc911063ac72ed44e84c0c5af28df41c25d452/fabbri_et_al_based_composite_SAN_model.sedml",
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
