import json
import opencor as oc
import sys

simulation = oc.open_simulation(sys.argv[1])
data = simulation.data()

data.set_starting_point(float(sys.argv[2]))
data.set_ending_point(float(sys.argv[3]))
data.set_point_interval(float(sys.argv[4]))

simulation.run()

results = simulation.results()
constants = results.constants()
states = results.states()
rates = results.rates()
algebraic = results.algebraic()

res = {'message': 'All good!'}

print(json.dumps(res))
