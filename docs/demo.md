# SimulationVuer Live Demo

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
      id: 157,
    };
  }
}
</script>

## Code Preview

```js-vue
  <div class="your-outer-container">
    <SimulationVuer
      :apiLocation="apiLocation"
      :id="dataset.id"
    />
  </div>

  <script>
    import { SimulationVuer } from "@abi-software/simulationvuer";

    export default {
      components: { SimulationVuer },
      data: function () {
        return {
          apiLocation: API_LOCATION,
          id: 157,
        }
      }
    }
  </script>
```
