# SimulationVuer

SimulationVuer is a [Vue](https://vuejs.org/) component to configure and run a [CellML](https://cellml.org/)-based model of some biological process, and to visualise the results of that simulation.

## How to use

To install the package to your Vue application:

```bash
npm install @abi-software/simulationvuer
```

To include the package in your script:

```javascript
import { SimulationVuer } from '@abi-software/simulationvuer';
import '@abi-software/simulationvuer/dist/simulationvuer.css';
```

To register in a Vue component:

```javascript
export default {
  ...
  components: {
    SimulationVuer
  }
  ...
}
```

The above registers the SimulationVuer component into the global scope.
You can now use the SimulationVuer in your Vue template as follows:

```html
<SimulationVuer/>
```

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
npm run build
```

#### Lint and fix files

```bash
npm run lint
```
