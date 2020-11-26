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
        <table class="simulation">
          <thead>
            <tr>
              <th colspan="3">Simulation properties</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="name">Starting point</td>
              <td>
                <input v-model="data.simulation.starting_point" :disabled="isRetrievingResults()" />
              </td>
              <td class="unit">{{ data.simulation.unit }}</td>
            </tr>
            <tr>
              <td class="name">Ending point</td>
              <td>
                <input v-model="data.simulation.ending_point" :disabled="isRetrievingResults()" />
              </td>
              <td class="unit">{{ data.simulation.unit }}</td>
            </tr>
            <tr>
              <td class="name">Point interval</td>
              <td>
                <input v-model="data.simulation.point_interval" :disabled="isRetrievingResults()" />
              </td>
              <td class="unit">{{ data.simulation.unit }}</td>
            </tr>
          </tbody>
        </table>
        <table class="model">
          <thead>
            <tr>
              <th colspan="3">Model properties</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="modelEntry in data.model" :key="modelEntry.name">
              <td class="name">{{ variableName(modelEntry.name) }}</td>
              <td>
                <input v-model="modelEntry.value" :disabled="isRetrievingResults()" />
              </td>
              <td class="unit">{{ modelEntry.unit }}</td>
            </tr>
          </tbody>
        </table>
        <button type="button" @click="runModel" :disabled="isRetrievingResults()">Run the model</button>
      </form>
    </div>
    <div v-if="hasResults() && !isRetrievingResults()">
      <PlotVuer :dataInput="results.json" :plotType="'scatter'" />
    </div>
    <div class="info" v-if="isRetrievingResults()">
      <svg>
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <p>Running the model...</p>
    </div>
    <div v-if="hasError() && !isRetrievingResults()">
      <div class="error" v-for="errorEntry in error" :key="errorEntry">
        <svg>
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
import { PlotVuer } from "@abi-software/plotvuer";
import "@abi-software/plotvuer/dist/plotvuer.css";

export default {
  name: "SimulationVuer",
  components: {
    PlotVuer,
  },
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
    variableName: function (name) {
      return name.split("/")[1];
    },
    runModel: function () {
      this.retrievingResults = true;
      this.results = null;
      this.error = null;

      axios
        .get("http://localhost:5000/run?url=" + encodeURIComponent(this.url) + "&starting_point=" + this.data.simulation.starting_point + "&ending_point=" + this.data.simulation.ending_point + "&point_interval=" + this.data.simulation.point_interval + "&V_ode=" + this.data.model[0].value + "&ACh=" + this.data.model[1].value + "&Iso_1_uM=" + this.data.model[2].value)
        .then((res) => {
          this.retrievingResults = false;

          if (res.data.error) {
            this.error = [res.data.error];
          } else {
            this.results = res.data.results;

            this.results.json = [[this.results[0].name + " (" + this.results[0].unit + ")", this.results[1].name + " (" + this.results[1].unit + ")"]];

            for (let i = 0; i < this.results[0].values.length; ++i) {
              this.results.json.push([this.results[0].values[i], this.results[1].values[i]]);
            }
          }
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
          this.error = [res.data.error];
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
  background-color: rgba(217, 226, 243, 0.3);
  border-left-color: rgba(68, 114, 196, 0.7);
  color: rgb(68, 114, 196);
}
div.error {
  background-color: rgba(251, 229, 213, 0.3);
  border-left-color: rgba(237, 125, 49, 0.7);
  color: rgb(237, 125, 49);
}
div.info svg,
div.error svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}
div.info svg {
  color: rgba(68, 114, 196, 0.6);
}
div.error svg {
  color: rgba(237, 125, 49, 0.6);
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
  width: 100%;
  margin-bottom: 0.5rem;
  border: 2px solid;
  border-radius: 4px;
  background-color: white;
}
div.data table.simulation {
  border-color: rgb(201, 201, 201);
}
div.data table.model {
  border-color: rgb(156, 195, 229);
}
div.data th,
div.data td {
  padding: 3px 9px;
  cursor: default;
}
div.data table.simulation th {
  background-color: rgb(201, 201, 201);
  color: rgb(82, 82, 82);
}
div.data table.model th {
  background-color: rgb(156, 195, 229);
  color: rgb(30, 78, 121);
}
div.data td {
  width: 35%;
  background-color: rgb(249, 249, 249);
}
div.data td.name {
  font-weight: 700;
}
div.data td.unit {
  font-style: italic;
}
div.data button {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 7px 16px;
  border: none;
  border-radius: 4px;
  background-color: rgb(168, 208, 141);
  color: rgb(55, 86, 35);
  cursor: pointer;
}
div.data button:disabled {
  background-color: rgb(237, 237, 237);
  color: rgb(165, 165, 165);
  cursor: default;
}
</style>
