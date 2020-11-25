import json
import opencor as oc
import sys

simulation = oc.open_simulation(sys.argv[1])
data = simulation.data()

data.set_ending_point(1.0)
data.set_point_interval(0.001)

simulation.run()

results = simulation.results()
constants = results.constants()
states = results.states()
rates = results.rates()
algebraic = results.algebraic()

res = {'message': 'All good!'}

print(json.dumps(res))
