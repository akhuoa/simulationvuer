<template>
  <div class="simulation-container">
    <div class="info" v-if="!hasData() && !hasError()">
      <svg>
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <p>Retrieving some information about the simulation and the model...</p>
    </div>
    <div class="data" v-if="hasData()">
      <form>
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
                <input :value="data.simulation.starting_point" :disabled="isRetrievingResults()" />
              </td>
              <td>{{ data.simulation.unit }}</td>
            </tr>
            <tr>
              <td>Ending point</td>
              <td>
                <input :value="data.simulation.ending_point" :disabled="isRetrievingResults()" />
              </td>
              <td>{{ data.simulation.unit }}</td>
            </tr>
            <tr>
              <td>Point interval</td>
              <td>
                <input :value="data.simulation.point_interval" :disabled="isRetrievingResults()"/>
              </td>
              <td>{{ data.simulation.unit }}</td>
            </tr>
          </tbody>
        </table>
        <button type="button" @click="runModel" :disabled="isRetrievingResults()">Run the model</button>
      </form>
    </div>
    <div class="info" v-if="hasResults() && !isRetrievingResults()">
      <svg>
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <p>
        {{ results }}
      </p>
    </div>
    <div class="info" v-if="isRetrievingResults()">
      <svg>
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <p>Running the model...</p>
    </div>
    <div v-if="hasError() && !isRetrievingResults()">
      <div class="error" v-for="errorEntry in error" :key="errorEntry">
        <svg class="error">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p>
          {{ errorEntry }}
        </p>
      </div>
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
      retrievingResults: false,
      results: null,
      error: null,
    };
  },
  methods: {
    hasData: function () {
      return this.data != null;
    },
    isRetrievingResults: function () {
      return this.retrievingResults;
    },
    hasResults: function () {
      return this.results != null;
    },
    hasError: function () {
      return this.error != null;
    },
    runModel: function () {
      this.retrievingResults = true;
      axios
        .get("http://localhost:5000/run?url=" + encodeURIComponent(this.url))
        .then((res) => {
          this.retrievingResults = false;
          this.results = res.data.message;
        })
        .catch((error) => {
          this.retrievingResults = false;
          this.error = [error.message];
        });
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
        this.error = [error.message];
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
  margin-bottom: 0.5rem;
  border-left: 4px solid;
  padding: 1rem;
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
div.info svg,
div.error svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}
div.info svg {
  color: rgb(99, 179, 237);
}
div.error svg {
  color: rgb(246, 173, 85);
}
div.info p,
div.error p {
  margin: 0;
  margin-left: 0.5rem;
}
div.data {
  width: fit-content;
  margin: auto;
}
div.data table {
  border: 2px solid rgb(65, 184, 131);
  border-radius: 4px;
  background-color: white;
}
div.data th,
div.data td {
  padding: 3px 9px;
  cursor: default;
}
div.data th {
  background-color: rgb(65, 184, 131);
  color: white;
}
div.data td {
  background-color: rgb(249, 249, 249);
}
div.data button {
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 7px 16px;
  border: none;
  border-radius: 4px;
  background-color: rgb(65, 184, 131);
  color: white;
  outline: none;
  cursor: pointer;
}
div.data button:disabled {
  background-color: lightgray;
  color: gray;
  cursor: default;
}
</style>
