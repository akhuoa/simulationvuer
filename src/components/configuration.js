export function jsonForNormalModel() {
  return {
    simulation: {
      endingPoint: 3.0,
      pointInterval: 0.001,
      parameters: [
        {
          name: "Rate_modulation_experiments/Iso_1_uM",
          value: "(sm == 0)?0.0:1.0",
        },
        {
          name: "Rate_modulation_experiments/ACh",
          value: "(sm == 0)?0.0:(sm === 1)?(1.0-0.1*sl)*22.0e-6:22.0e-6+0.1*sl*(38.0e-6-22.0e-6)",
        },
      ]
    },
    input: [
      {
        id: "sm",
        name: "Simulation mode",
        defaultValue: 0,
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
        enabled: "(sm == 1) || (sm == 2)",
        name: "Stimulation level",
        defaultValue: 0,
        minimumValue: 0,
        maximumValue: 10,
      },
    ],
    output: [
      "Membrane/V",
    ],
  };
}

export function jsonForCompositeModel() {
  return {
    input: [
      {
        name: "Spike frequency",
        defaultValue: 300,
        minimumValue: 0,
        maximumValue: 1000,
      },
      {
        name: "Spike number",
        defaultValue: 10,
        minimumValue: 0,
        maximumValue: 30,
      },
      {
        name: "Spike amplitude",
        defaultValue: 10,
        minimumValue: 0,
        maximumValue: 30,
      },
    ],
    output: [
      "Membrane/V",
      "Brain_stem/w",
    ],
  };
}
