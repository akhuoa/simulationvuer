# SimulationVuer

SimulationVuer is a [Vue](https://vuejs.org/) component to configure and run a [CellML](https://cellml.org/)-based model of some biological process, and to visualise the results of that simulation.

## How to use

To install the package to your Vue application:

```bash
yarn install @abi-software/simulationvuer
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

### Flask application

SimulationVuer relies on [OpenCOR](https://opencor.ws/) to configure and run a model, which can be done using its [Python](https://www.python.org/) interface.
However, a Vue component cannot run a Python script directly, so we do this through a [Flask](https://palletsprojects.com/p/flask/)-based [API](https://en.wikipedia.org/wiki/API).

For this to work, OpenCOR must be installed on the server and Flask be available in your Python environment:

```bash
pip3 install flask flask-cors
```

Next, you need to specify where our Flask application can find OpenCOR's Python shell:

```bash
export OPENCOR_PYTHONSHELL=[OpenCOR]/pythonshell
```

Now, we can start our Flask application:

```bash
cd [SimulationVuer]
python3 api/opencor.py
```

### Vue component

#### Setup

```bash
yarn
```

#### Run the sample application

```bash
yarn serve
```

#### Compile and minify for production

```bash
yarn build
```

#### Lint and fix files

```bash
yarn lint
```
