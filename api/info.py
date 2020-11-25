import json
import opencor as oc
import sys

simulation = oc.open_simulation(sys.argv[1])
valid = True if simulation.valid() else False

res = {'valid': valid}

if valid:
    data = simulation.data()
    data_states = data.states()
    data_constants = data.constants()
    results = simulation.results()
    results_states = results.states()
    results_constants = results.constants()

    res.update({'simulation': {'starting_point': data.starting_point(),
                               'ending_point': data.ending_point(),
                               'point_interval': data.point_interval(),
                               'unit': results.voi().unit()}})
    res.update({'model': [{'name': 'Membrane/V_ode',
                           'value': data_states['Membrane/V_ode'],
                           'unit': results_states['Membrane/V_ode'].unit()},
                          {'name': 'Rate_modulation_experiments/ACh',
                           'value': data_constants['Rate_modulation_experiments/ACh'],
                           'unit': results_constants['Rate_modulation_experiments/ACh'].unit()},
                          {'name': 'Rate_modulation_experiments/Iso_1_uM',
                           'value': data_constants['Rate_modulation_experiments/Iso_1_uM'],
                           'unit': results_constants['Rate_modulation_experiments/Iso_1_uM'].unit()}]})
else:
    res.update({'error': simulation.issues()})

oc.close_simulation(simulation)

print(json.dumps(res))
