from flask import Flask, jsonify, request
from flask_cors import CORS


# Instantiate our Flask application.
app = Flask(__name__)

# Enable Cross Origin Resource Sharing (CORS).
CORS(app, resources={r'/*': {'origins': '*'}})


@app.route('/info')
def info():
    """
    Entry point to retrieve some information about a model, given its URL.
    """

    return jsonify('Some information about \'' + request.args.get('url') + '\'...')
