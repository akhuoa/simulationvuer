import json
import numpy as np
import opencor as oc
import sys


def run(mode, level):
    simulation = oc.open_simulation(
        'https://models.physiomeproject.org/e/568/HumanSAN_Fabbri_Fantini_Wilders_Severi_2017.cellml')

    data = simulation.data()

    data.set_ending_point(3.0)
    data.set_point_interval(0.001)

    if mode != 0:
        constants = data.constants()

        constants['Rate_modulation_experiments/Iso_1_uM'] = 1.0

        if mode == 1:
            constants['Rate_modulation_experiments/ACh'] = (
                1.0 - level) * 22.0e-6
        else:  # Vagal stimulation.
            constants['Rate_modulation_experiments/ACh'] = 22.0e-6 + \
                level * (38.0e-6 - 22.0e-6)

    simulation.run()

    results = simulation.results()

    print(json.dumps([{
        'x': results.voi().values().tolist(),
        'y': results.states()['Membrane/V_ode'].values().tolist(),
    }]))

    oc.close_simulation(simulation)


def usage():
    print(
        "Usage: [OpenCOR]/pythonshell [SimulationVuer]/scripts/run.py <SimulationMode> <StimulationLevel>")
    print("  where <SimulationMode> is the simulation mode as an integer value. Supported values are:")
    print("    - 0: normal sinus rhythm;")
    print("    - 1: stellate stimulation; and")
    print("    - 2: vagal stimulation.")
    print("  where <StimulationLevel> is the stimulation level as a decimal value between 0 and 1.")


if __name__ == "__main__":
    args = sys.argv

    args.pop(0)  # Script name.

    mode = 0
    level = 1.0

    try:
        mode = int(args.pop(0))
        level = float(args.pop(0))

        if (mode < 0) or (mode > 2) or (level < 0.0) or (level > 1.0):
            raise Exception()
    except:
        usage()

        sys.exit(1)

    run(mode, level)
