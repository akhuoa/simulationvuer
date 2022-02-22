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
        type: "array",
      },
      output: {
        items: {
          additionalProperties: false,
          properties: {
            name: {
              required: true,
              type: "string",
            },
            xAxisTitle: {
              required: true,
              type: "string",
            },
            yAxisTitle: {
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

  let idUsed = [];
  let inputValid = json.input.every((input) => {
    if (input.name === "") {
      console.warn("JSON: an input name must not be empty.");

      return false;
    }

    if (input.id !== undefined) {
      if (input.id === "") {
        console.warn("JSON: an input id must not be empty.");

        return false;
      }

      if (idUsed[input.id]) {
        console.warn("JSON: an input id must be unique (" + input.id + " is used more than once).");

        return false;
      }

      idUsed[input.id] = true;
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

  let outputValid = json.output.every((output) => {
    if (output.name === "") {
      console.warn("JSON: an output name must not be empty.");

      return false;
    }

    if (output.xAxisTitle === "") {
      console.warn("JSON: an output X axis title must not be empty.");

      return false;
    }

    if (output.yAxisTitle === "") {
      console.warn("JSON: an output Y axis title must not be empty.");

      return false;
    }

    return true;
  });

  if (!outputValid) {
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
