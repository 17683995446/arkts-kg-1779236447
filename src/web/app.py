from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.database import Database
from src.llm import LLMClient

app = Flask(__name__)
CORS(app)

db = None
llm_client = None


def init_app(database: Database, llm: LLMClient):
    global db, llm_client
    db = database
    llm_client = llm


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/files')
def get_files():
    files = db.get_all_files()
    return jsonify([
        {
            'id': f['id'],
            'path': f['path'],
            'modified': f['modified']
        }
        for f in files
    ])


@app.route('/api/file/<int:file_id>')
def get_file_details(file_id):
    functions = db.get_functions_by_file(file_id)
    classes = db.get_classes_by_file(file_id)
    imports = db.get_imports_by_file(file_id)

    return jsonify({
        'functions': functions,
        'classes': classes,
        'imports': imports
    })


@app.route('/api/query', methods=['POST'])
def query_llm():
    data = request.get_json()
    query = data.get('query', '')
    context = data.get('context', [])
    result = llm_client.query_code(query, context)
    return jsonify({'result': result})


def run_server(host='0.0.0.0', port=5000):
    app.run(host=host, port=port, debug=False, threaded=True)
