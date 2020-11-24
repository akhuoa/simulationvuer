from flask import Flask, jsonify
from flask_cors import CORS


# Instantiate our Flask application.
app = Flask(__name__)

# Enable Cross Origin Resource Sharing (CORS).
CORS(app, resources={r'/*': {'origins': '*'}})


# Entry point to retrieve some information about a model.
@app.route('/info/<modelUrl>')
def info(modelUrl):
    return jsonify(['Some information about \'' + modelUrl + '\'...'])
