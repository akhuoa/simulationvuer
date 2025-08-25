# Live demo for a direct URL to an OMEX file

This is a live demo of the `SimulationVuer` component for a path to a PMR file.
Here, the [Lorenz model](https://en.wikipedia.org/wiki/Lorenz_system) (avaialble [here](https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/lorenz.omex)) is used.
The simulation is run in the browser and it is rerun automatically whenever you modify some of the model parameters.

## Live demo

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
      id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/lorenz.omex",
    };
  }
}
</script>

## Code preview

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
          id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/lorenz.omex",
        }
      }
    }
  </script>
```
