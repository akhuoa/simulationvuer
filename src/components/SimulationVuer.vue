<template>
  <div class="simulation-container">
    <div class="info" v-if="!hasData() && !hasError()">
      <svg class="info">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <p>
        Retrieving data for <a :href="url">{{ url }}</a>...
      </p>
    </div>
    <form v-if="hasData()">
      <table>
        <thead>
          <tr>
            <th colspan="3">Simulation properties</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Starting point</td>
            <td>
              <input :value="data.simulation.starting_point" />
            </td>
            <td>{{ data.simulation.unit }}</td>
          </tr>
          <tr>
            <td>Ending point</td>
            <td>
              <input :value="data.simulation.ending_point" />
            </td>
            <td>{{ data.simulation.unit }}</td>
          </tr>
          <tr>
            <td>Point interval</td>
            <td>
              <input :value="data.simulation.point_interval" />
            </td>
            <td>{{ data.simulation.unit }}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <button>Run model</button>
    </form>
    <div class="error" v-if="hasError()">
      <svg class="error">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <p>
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SimulationVuer",
  props: ["url"],
  data: function () {
    return {
      data: null,
      error: "",
    };
  },
  methods: {
    hasData: function () {
      return this.data != null;
    },
    hasError: function () {
      return this.error != "";
    },
  },
  created() {
    axios
      .get("http://localhost:5000/info?url=" + encodeURIComponent(this.url))
      .then((res) => {
        if (res.data.valid) {
          this.data = res.data;
        } else {
          this.error = res.data.error;
        }
      })
      .catch((error) => {
        this.error = error;
      });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.simulation-container {
  width: 100%;
  height: 100%;
}
div.info,
div.error {
  display: flex;
  border-left: 4px solid;
  padding: 1rem;
}
div.info > p,
div.error > p {
  margin: 0;
  margin-left: 0.5rem;
}
div.info {
  background-color: rgb(235, 248, 255);
  border-left-color: rgb(99, 179, 237);
  color: rgba(43, 108, 176);
}
div.error {
  background-color: rgb(255, 250, 240);
  border-left-color: rgb(246, 173, 85);
  color: rgba(192, 86, 33);
}
svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}
svg.info {
  color: rgb(99, 179, 237);
}
svg.error {
  color: rgb(246, 173, 85);
}
div > form {
  position: absolute;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, 0%);
}
table {
  border: 2px solid #42b983;
  border-radius: 4px;
  background-color: white;
}
th,
td {
  padding: 3px 9px;
  cursor: default;
}
th {
  background-color: #42b983;
  color: white;
  font-weight: 700;
}
td {
  background-color: #f9f9f9;
}
button {
  padding: 7px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}
</style>
