import json
import opencor as oc
import sys

simulation = oc.open_simulation(sys.argv[1])
# simulation = oc.open_simulation('https://raw.githubusercontent.com/opencor/opencor/master/models/tests/cellml/underconstrained_model.cellml')
valid = True if simulation.valid() else False

res = {'valid': valid}

if valid:
    data = simulation.data()
    simulation_unit = simulation.results().voi().unit()

    res.update({'simulation': {'starting_point': data.starting_point(),
                               'ending_point': data.ending_point(),
                               'point_interval': data.point_interval(),
                               'unit': simulation_unit}})
else:
    res.update({'error': simulation.issues()})

oc.close_simulation(simulation)

print(json.dumps(res))
