<template>
  <div class="simulation-container">
    <p>
      <strong>Model URL:</strong><br />
      <a :href="modelUrl">{{ modelUrl }}</a>
    </p>
    <p>
      <strong>Model information:</strong><br />
      {{ modelInfo }}
    </p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SimulationVuer",
  props: ["modelUrl"],
  data() {
    return {
      modelInfo: "null",
    };
  },
  created() {
    console.log("About to use our Flask application...");
    const path = "http://localhost:5000/info/test";
    axios
      .get(path)
      .then((res) => {
        this.modelInfo = res.data;
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(error);
      });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.simulation-container {
  width: 100%;
  height: 100%;
}
</style>
