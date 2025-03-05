# SimulationVuer Live Demo (for a simulation-based dataset)

This is a live demo of the `SimulationVuer` component for a simulation-based dataset.
Here, dataset [135](https://sparc.science/datasets/135?type=simulation) is used.
Click on the `Run Simulation` button to run the simulation through [o<sup>2</sup>S<sup>2</sup>PARC](https://osparc.io/).
You need to click on that button again whenever you modify some of the model parameters.

## Live Demo

<div class="demo-map-container">
  <div class="demo-map-container-inner">
    <ClientOnly>
      <SimulationVuer
        :apiLocation="apiLocation"
        :id="id"
      />
    </ClientOnly>
  </div>
</div>

<script setup>
import { defineClientComponent } from "vitepress";
import "./demo-styles.css";

const SimulationVuer = defineClientComponent(() => {
  return import("../src/components/SimulationVuer.vue");
})
</script>

<script>
export default {
  data: function() {
    return {
      apiLocation: import.meta.env.VITE_API_LOCATION,
      id: 135,
    };
  }
}
</script>

## Code Preview

```js-vue
  <div class="your-outer-container">
    <SimulationVuer
      :apiLocation="apiLocation"
      :id="id"
    />
  </div>

  <script>
    import { SimulationVuer } from "@abi-software/simulationvuer";

    export default {
      components: { SimulationVuer },
      data: function () {
        return {
          apiLocation: API_LOCATION,
          id: 135,
        }
      }
    }
  </script>
```
