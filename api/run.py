import json
import opencor as oc
import sys

simulation = oc.open_simulation(sys.argv[1])
data = simulation.data()

data.set_starting_point(float(sys.argv[2]))
data.set_ending_point(float(sys.argv[3]))
data.set_point_interval(float(sys.argv[4]))

data.states()['Membrane/V_ode'] = float(sys.argv[5])

data_constants = data.constants()

data_constants['Rate_modulation_experiments/ACh'] = float(sys.argv[6])
data_constants['Rate_modulation_experiments/Iso_1_uM'] = float(sys.argv[7])

simulation.run()

res = {'results': simulation.results().states()['Membrane/V_ode'].values().tolist()}

print(json.dumps(res))
