<template>
  <div id="app">
    <SimulationVuer/>
  </div>
</template>

<script>
import SimulationVuer from './components/SimulationVuer.vue'

export default {
  name: 'App',
  components: {
    SimulationVuer
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
