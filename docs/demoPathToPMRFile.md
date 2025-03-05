# SimulationVuer Live Demo (for a path to a PMR file)

This is a live demo of the `SimulationVuer` component for a path to a PMR file.
Here, the [Lorenz model](https://en.wikipedia.org/wiki/Lorenz_system) avaialble at [here](https://models.physiomeproject.org/workspace/b7c/file/e0ae8d2d56aaaa091e23e1ee7e84cacbda1dfb6b/) is used.
The simulation is run in the browser and it is rerun automatically whenever you modify some of the model parameters.

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
      id: "workspace/b7c/rawfile/e0ae8d2d56aaaa091e23e1ee7e84cacbda1dfb6b/lorenz.omex",
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
          id: "workspace/b7c/rawfile/e0ae8d2d56aaaa091e23e1ee7e84cacbda1dfb6b/lorenz.omex",
        }
      }
    }
  </script>
```
