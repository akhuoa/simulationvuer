import json
import numpy as np
import opencor as oc
import pathlib
import sys
import tempfile

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

results = simulation.results()
voi = results.voi()
V_ode = results.states()['Membrane/V_ode']
csv_filename = tempfile.NamedTemporaryFile().name+'.csv'

np.savetxt(csv_filename, np.stack((voi.values(), V_ode.values()), axis=1), comments='', header=voi.name()+' ('+voi.unit()+'),'+V_ode.name()+' ('+V_ode.unit()+')', delimiter=",")

res = {'results': pathlib.Path(csv_filename).as_uri()}

print(json.dumps(res))
