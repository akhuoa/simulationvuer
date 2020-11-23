<template>
  <div class="simulation-container">
    <p>
      Model URL:<br />
      <a :href="modelUrl">{{ modelUrl }}</a>
    </p>
  </div>
</template>

<script>
export default {
  name: "SimulationVuer",
  props: ["modelUrl"],
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.simulation-container {
  width: 100%;
  height: 100%;
}
</style>
