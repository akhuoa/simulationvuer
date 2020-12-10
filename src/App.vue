<template>
  <div id="app">
    <div class="app">
      <h1>SimulationVuer</h1>
      <p>
        This vuer demonstrates the simulation of the <a href="https://models.physiomeproject.org/e/568">Fabbri <em>et al.</em> (2017)</a> model.
      </p>
    </div>
    <hr />
    <SimulationVuer/>
  </div>
</template>

<script>
import SimulationVuer from "./components/SimulationVuer.vue";

export default {
  name: "App",
  components: {
    SimulationVuer,
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
