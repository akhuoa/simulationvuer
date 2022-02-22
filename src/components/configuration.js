export function jsonForNormalModel() {
  return {
    input: [
      {
        defaultValue: 0,
        id: "sm",
        name: "Simulation mode",
        possibleValues: [
          {
            name: "Normal sinus rhythm",
            value: 0,
          },
          {
            name: "Stellate stimulation",
            value: 1,
          },
          {
            name: "Vagal stimulation",
            value: 2,
          },
        ],
      },
      {
        defaultValue: 0,
        enabled: "(sm == 1) || (sm == 2)",
        id: "sl",
        maximumValue: 10,
        minimumValue: 0,
        name: "Stimulation level",
      },
    ],
    output: [
      {
        name: "Membrane/V",
      },
    ],
    parameters: [
      {
        name: "Rate_modulation_experiments/Iso_1_uM",
        value: "(sm == 0) ? 0.0 : 1.0",
      },
      {
        name: "Rate_modulation_experiments/ACh",
        value: "(sm == 0) ? 0.0 : (sm === 1) ? (1.0 - 0.1 * sl) * 22.0e-6 : 22.0e-6 + 0.1 * sl * (38.0e-6 - 22.0e-6)",
      },
    ],
    simulation: {
      endingPoint: 3.0,
      pointInterval: 0.001,
    },
  };
}

export function jsonForCompositeModel() {
  return {
    input: [
      {
        defaultValue: 300,
        id: "sf",
        maximumValue: 1000,
        minimumValue: 0,
        name: "Spike frequency",
      },
      {
        defaultValue: 10,
        id: "sn",
        maximumValue: 30,
        minimumValue: 0,
        name: "Spike number",
      },
      {
        defaultValue: 10,
        id: "sa",
        maximumValue: 30,
        minimumValue: 0,
        name: "Spike amplitude",
      },
    ],
    output: [
      {
        name: "Membrane/V",
      },
      {
        name: "Brain_stem/w",
      },
    ],
    parameters: [
      {
        name: "Brain_stem/t_period",
        value: "sf",
      },
      {
        name: "Brain_stem/w_n",
        value: "sn",
      },
      {
        name: "Brain_stem/w_value",
        value: "0.01 * sa",
      },
    ],
  };
}
