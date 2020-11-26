from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import subprocess


def run_pythonscript(pythonscript, url, *args):
    pythonshell = os.getenv('OPENCOR_PYTHONSHELL')

    if not pythonshell:
        return jsonify(error='\'OPENCOR_PYTHONSHELL\' has not been set.',
                       valid=False)

    if not url:
        return jsonify(error='No URL was provided.',
                       valid=False)

    if len(args) == 0:
        res = subprocess.run([pythonshell, os.path.dirname(os.path.abspath(__file__)) + '/' + pythonscript, url],
                             capture_output=True, text=True)
    else:
        res = subprocess.run([pythonshell, os.path.dirname(os.path.abspath(__file__)) + '/' + pythonscript, url, args[0], args[1], args[2]],
                             capture_output=True, text=True)

    if res.returncode != 0:
        return jsonify(error=res.stderr,
                       valid=False)

    return json.loads(res.stdout)


# Instantiate our Flask application.
app = Flask(__name__)

# Enable Cross Origin Resource Sharing (CORS).
CORS(app, resources={r'/*': {'origins': '*'}})


@app.route('/info')
def info():
    """
    Entry point to retrieve some information about a model, given its URL (passed as an attribute).
    """

    return run_pythonscript('info.py', request.args.get('url'))


@app.route('/run')
def run():
    """
    Entry point to run a model, given its URL (passed as an attribute).
    """

    return run_pythonscript('run.py', request.args.get('url'),
                            request.args.get('starting_point'),
                            request.args.get('ending_point'),
                            request.args.get('point_interval'))


app.run()
