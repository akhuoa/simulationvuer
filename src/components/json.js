import { Validator } from "jsonschema";

export function validJson(json) {
  // Check the JSON against our schema.

  let validator = new Validator();
  let schema = {
    additionalProperties: false,
    properties: {
      input: {
        items: {
          oneOf: [
            {
              additionalProperties: false,
              properties: {
                defaultValue: {
                  required: true,
                  type: "number",
                },
                enabled: {
                  type: "string",
                },
                id: {
                  type: "string",
                },
                name: {
                  required: true,
                  type: "string",
                },
                possibleValues: {
                  items: {
                    additionalProperties: false,
                    properties: {
                      name: {
                        required: true,
                        type: "string",
                      },
                      value: {
                        required: true,
                        type: "number",
                      },
                    },
                    type: "object",
                  },
                  minItems: 1,
                  required: true,
                  type: "array",
                },
              },
            },
            {
              additionalProperties: false,
              properties: {
                defaultValue: {
                  required: true,
                  type: "number",
                },
                enabled: {
                  type: "string",
                },
                id: {
                  type: "string",
                },
                maximumValue: {
                  required: true,
                  type: "number",
                },
                minimumValue: {
                  required: true,
                  type: "number",
                },
                name: {
                  required: true,
                  type: "string",
                },
              },
            },
          ],
          type: "object",
        },
        minItems: 1,
        required: true,
        type: "array",
      },
      output: {
        additionalProperties: false,
        minItems: 1,
        properties: {
          data: {
            items: {
              additionalProperties: false,
              properties: {
                id: {
                  required: true,
                  type: "string",
                },
                name: {
                  required: true,
                  type: "string",
                },
              },
              type: "object",
            },
            minItems: 1,
            required: true,
            type: "array",
          },
          plots: {
            items: {
              additionalProperties: false,
              properties: {
                xAxisTitle: {
                  required: true,
                  type: "string",
                },
                xValue: {
                  required: true,
                  type: "string",
                },
                yAxisTitle: {
                  required: true,
                  type: "string",
                },
                yValue: {
                  required: true,
                  type: "string",
                },
              },
              type: "object",
            },
            maxItems: 9,
            minItems: 1,
            required: true,
            type: "array",
          },
        },
        required: true,
        type: "object",
      },
      parameters: {
        items: {
          additionalProperties: false,
          properties: {
            name: {
              required: true,
              type: "string",
            },
            value: {
              required: true,
              type: "string",
            },
          },
          type: "object",
        },
        type: "array",
      },
      simulation: {
        additionalProperties: false,
        properties: {
          endingPoint: {
            required: true,
            type: "number",
          },
          pointInterval: {
            required: true,
            type: "number",
          },
        },
        type: "object",
      },
    },
    type: "object",
  };

  let result = validator.validate(json, schema, { nestedErrors: true });

  if (!result.valid) {
    console.warn(result.toString());

    return false;
  }

  // Make sure that the input information makes sense.

  let inputIdUsed = [];
  let inputValid = json.input.every((input) => {
    if (input.id !== undefined) {
      if (input.id === "") {
        console.warn("JSON: an input id must not be empty.");

        return false;
      }

      if (inputIdUsed[input.id]) {
        console.warn("JSON: an input id must be unique (" + input.id + " is used more than once).");

        return false;
      }

      inputIdUsed[input.id] = true;
    }

    if (input.name === "") {
      console.warn("JSON: an input name must not be empty.");

      return false;
    }

    if (input.possibleValues !== undefined) {
      if (!input.possibleValues.every((possibleValue) => {
        if (possibleValue.name === "") {
          console.warn("JSON: an input possible value must not have an empty name.");

          return false;
        }

        return true;
      })) {
        return false;
      }

      let values = input.possibleValues.map((value) => {
        return value.value;
      });
      let valueUsed = [];

      if (!values.every((value) => {
        if (valueUsed[value]) {
          console.warn("JSON: an input possible value must have a unique value (" + value + " is used more than once).");

          return false;
        }

        valueUsed[value] = true;

        return true;
      })) {
        return false;
      }

      if (!values.includes(input.defaultValue)) {
        console.warn("JSON: the input default value (" + input.defaultValue + ") must be one of the possible values (" + values.join(", ") + ").");

        return false;
      }
    }

    if (input.enabled !== undefined) {
      if (input.enabled === "") {
        console.warn("JSON: an input enabled must not be empty.");

        return false;
      }
    }

    if ((input.minimumValue !== undefined) && (input.maximumValue !== undefined)) {
      if (input.minimumValue >= input.maximumValue) {
        console.warn("JSON: the input minimum value (" + input.minimumValue + ") must be lower than the maximum value (" + input.maximumValue + ").");

        return false;
      }

      if ((input.defaultValue < input.minimumValue) || (input.defaultValue > input.maximumValue)) {
        console.warn("JSON: the input default value (" + input.defaultValue + ") must be greater or equal to the minimum value (" + input.minimumValue + ") and lower or equal to the maximum value (" + input.maximumValue + ").");

        return false;
      }
    }

    return true;
  });

  if (!inputValid) {
    return false;
  }

  // Make sure that the output information makes sense.

  let outputIdUsed = [];
  let outputDataValid = json.output.data.every((outputData) => {
    if (outputData.id !== undefined) {
      if (outputData.id === "") {
        console.warn("JSON: an output data id must not be empty.");

        return false;
      }

      if (outputIdUsed[outputData.id]) {
        console.warn("JSON: an output data id must be unique (" + outputData.id + " is used more than once).");

        return false;
      }

      outputIdUsed[outputData.id] = true;
    }

    if (outputData.name === "") {
      console.warn("JSON: an output data name must not be empty.");

      return false;
    }

    return true;
  });

  if (!outputDataValid) {
    return false;
  }

  let outputPlotsValid = json.output.plots.every((outputPlot) => {
    if (outputPlot.xAxisTitle === "") {
      console.warn("JSON: an output plot X axis title must not be empty.");

      return false;
    }

    if (outputPlot.xValue === "") {
      console.warn("JSON: an output plot X value must not be empty.");

      return false;
    }

    if (outputPlot.yAxisTitle === "") {
      console.warn("JSON: an output plot Y axis title must not be empty.");

      return false;
    }

    if (outputPlot.yValue === "") {
      console.warn("JSON: an output plot Y value must not be empty.");

      return false;
    }

    return true;
  });

  if (!outputPlotsValid) {
    return false;
  }

  // Make sure that the parameters information makes sense.

  let parametersValid = json.parameters.every((parameter) => {
    if (parameter.name === "") {
      console.warn("JSON: a parameter name must not be empty.");

      return false;
    }

    if (parameter.value === "") {
      console.warn("JSON: a parameter value must not be empty.");

      return false;
    }

    return true;
  });

  if (!parametersValid) {
    return false;
  }

  // Make sure that the simulation information makes sense.

  if (json.simulation !== undefined) {
    if (json.simulation.endingPoint <= 0.0) {
      console.warn("JSON: a simulation ending point must be greater than zero.");

      return false;
    }

    if (json.simulation.pointInterval <= 0.0) {
      console.warn("JSON: a simulation point interval must be greater than zero.");

      return false;
    }
  }

  return true;
}
