<template>
  <div class="simulation-container">
    <p>
      <strong>URL:</strong><br />
      <a :href="url">{{ url }}</a>
    </p>
    <p>
      <strong>Information:</strong><br />
      {{ info }}
    </p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SimulationVuer",
  props: ["url"],
  data() {
    return {
      info: "",
    };
  },
  created() {
    axios
      .get("http://localhost:5000/info?url=" + encodeURIComponent(this.url))
      .then((res) => {
        this.info = res.data;
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
