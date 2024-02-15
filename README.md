# SimulationVuer

SimulationVuer is a [Vue](https://vuejs.org/) component to configure and run a [CellML](https://cellml.org/)-based model of some biological process, and to visualise the results of that simulation.

## Vue 2 vs. Vue 3

SimulationVuer is now being developed as a Vue 3 component only.
The [Vue 2 version of SimulationVuer](https://github.com/ABI-Software/simulationvuer/tree/vue2) is not maintained anymore.

## How to use

To install the package to your Vue application:

```bash
npm install @abi-software/simulationvuer
```

To include the package in your script:

```javascript
import { SimulationVuer } from '@abi-software/simulationvuer';
```

To register in a Vue component:

```javascript
export default {
  ...
  components: {
    ...,
    SimulationVuer,
    ...
  }
  ...
}
```

The above registers the SimulationVuer component into the global scope.
You can now use the SimulationVuer in your Vue template as follows:

```html
<SimulationVuer :apiLocation="apiLocation" :id=123 />
```

where `apiLocation` is the URL to the API location and `id` the id of the dataset.

## Project setup

### Clone the respository

```bash
git clone https://github.com/ABI-Software/simulationvuer.git
```

### Vue component

#### Setup

```bash
npm install
```

#### Run the sample application

```bash
npm run serve
```

#### Compile and minify for production

```bash
npm run build-bundle
```
