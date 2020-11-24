from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import subprocess


def run_python_script(python_script, url):
    pythonshell = os.getenv('OPENCOR_PYTHONSHELL')

    if not pythonshell:
        return jsonify(error_message='\'OPENCOR_PYTHONSHELL\' has not been set.',
                       valid=False)

    if not url:
        return jsonify(error_message='No URL was provided.',
                       valid=False)

    res = subprocess.run([pythonshell, python_script],
                         capture_output=True, text=True)

    return jsonify(output=res.stdout, valid=True)


# Instantiate our Flask application.
app = Flask(__name__)

# Enable Cross Origin Resource Sharing (CORS).
CORS(app, resources={r'/*': {'origins': '*'}})


@app.route('/info')
def info():
    """
    Entry point to retrieve some information about a model, given its URL (passed as an attribute).
    """

    return run_python_script('/Users/Alan/OpenCOR/src/plugins/support/PythonSupport/tests/data/noble1962tests.py',
                             request.args.get('url'))


app.run()
