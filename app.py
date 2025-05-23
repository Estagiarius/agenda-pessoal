# Import Flask
from flask import Flask, jsonify, request
import sqlite3

# Initialize Flask app
app = Flask(__name__)

# Default database path, can be overridden for testing via app.DATABASE
app.DATABASE = 'database.db' 

def get_db_connection():
    """Establishes a connection to the database configured in the app instance."""
    # Access the DATABASE attribute from the app instance.
    # This allows tests to change app.DATABASE to a test-specific path.
    db_path = getattr(app, 'DATABASE', 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # This enables column access by name: row['column_name']
    return conn

# API Endpoints

# Projects
@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in projects])

@app.route('/api/projects', methods=['POST'])
def create_project():
    new_project = request.get_json()
    if not new_project or not 'name' in new_project:
        return jsonify({"error": "Missing name in request body"}), 400

    name = new_project['name']
    description = new_project.get('description', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO projects (name, description) VALUES (?, ?)',
                   (name, description))
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()

    if project_id:
        created_project = get_project_by_id(project_id) # Helper to fetch the created project
        return jsonify(created_project), 201
    else:
        return jsonify({"error": "Failed to create project"}), 500

def get_project_by_id(project_id):
    """Helper function to get a project by its ID."""
    conn = get_db_connection()
    project = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    conn.close()
    if project is None:
        return None
    return dict(project)

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = get_project_by_id(project_id)
    if project:
        return jsonify(project)
    else:
        return jsonify({"error": "Project not found"}), 404

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    updated_data = request.get_json()
    if not updated_data:
        return jsonify({"error": "Invalid JSON"}), 400

    name = updated_data.get('name')
    description = updated_data.get('description')

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if project exists
    project = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    if project is None:
        conn.close()
        return jsonify({"error": "Project not found"}), 404

    if name is not None and description is not None:
        cursor.execute('UPDATE projects SET name = ?, description = ? WHERE id = ?',
                       (name, description, project_id))
    elif name is not None:
        cursor.execute('UPDATE projects SET name = ? WHERE id = ?',
                       (name, project_id))
    elif description is not None:
        cursor.execute('UPDATE projects SET description = ? WHERE id = ?',
                       (description, project_id))
    else:
        conn.close()
        return jsonify({"error": "No fields to update"}), 400


    conn.commit()
    conn.close()

    updated_project_data = get_project_by_id(project_id)
    return jsonify(updated_project_data)


@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if project exists
    project = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    if project is None:
        conn.close()
        return jsonify({"error": "Project not found"}), 404

    cursor.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Project deleted"}), 200

# Parts
@app.route('/api/projects/<int:project_id>/parts', methods=['GET'])
def get_parts(project_id):
    # Check if project exists
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    conn = get_db_connection()
    parts = conn.execute('SELECT * FROM parts WHERE project_id = ?', (project_id,)).fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in parts])

def get_part_by_id(project_id, part_id):
    """Helper function to get a part by its ID and project_id."""
    conn = get_db_connection()
    part = conn.execute('SELECT * FROM parts WHERE id = ? AND project_id = ?', (part_id, project_id)).fetchone()
    conn.close()
    if part is None:
        return None
    return dict(part)

@app.route('/api/projects/<int:project_id>/parts', methods=['POST'])
def create_part(project_id):
    # Check if project exists
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    new_part_data = request.get_json()
    if not new_part_data or not 'name' in new_part_data:
        return jsonify({"error": "Missing name in request body"}), 400

    name = new_part_data['name']
    quantity = new_part_data.get('quantity', 1)
    specifications = new_part_data.get('specifications', '')
    supplier = new_part_data.get('supplier', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO parts (project_id, name, quantity, specifications, supplier) VALUES (?, ?, ?, ?, ?)',
                   (project_id, name, quantity, specifications, supplier))
    part_id = cursor.lastrowid
    conn.commit()
    conn.close()

    if part_id:
        created_part = get_part_by_id(project_id, part_id)
        return jsonify(created_part), 201
    else:
        return jsonify({"error": "Failed to create part"}), 500


@app.route('/api/projects/<int:project_id>/parts/<int:part_id>', methods=['GET'])
def get_part(project_id, part_id):
    part = get_part_by_id(project_id, part_id)
    if part:
        return jsonify(part)
    else:
        # Check if project exists to give a more specific error
        project = get_project_by_id(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify({"error": "Part not found"}), 404

@app.route('/api/projects/<int:project_id>/parts/<int:part_id>', methods=['PUT'])
def update_part(project_id, part_id):
    # Check if project exists first
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    updated_data = request.get_json()
    if not updated_data:
        return jsonify({"error": "Invalid JSON"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if part exists
    part = conn.execute('SELECT * FROM parts WHERE id = ? AND project_id = ?', (part_id, project_id)).fetchone()
    if part is None:
        conn.close()
        return jsonify({"error": "Part not found"}), 404

    # Collect fields to update
    fields_to_update = {}
    if 'name' in updated_data:
        fields_to_update['name'] = updated_data['name']
    if 'quantity' in updated_data:
        fields_to_update['quantity'] = updated_data['quantity']
    if 'specifications' in updated_data:
        fields_to_update['specifications'] = updated_data['specifications']
    if 'supplier' in updated_data:
        fields_to_update['supplier'] = updated_data['supplier']
    
    if not fields_to_update:
        conn.close()
        return jsonify({"error": "No fields to update"}), 400

    set_clause = ", ".join([f"{key} = ?" for key in fields_to_update.keys()])
    values = list(fields_to_update.values())
    values.append(part_id)
    values.append(project_id)

    cursor.execute(f'UPDATE parts SET {set_clause} WHERE id = ? AND project_id = ?', tuple(values))
    conn.commit()
    conn.close()

    updated_part_data = get_part_by_id(project_id, part_id)
    return jsonify(updated_part_data)

@app.route('/api/projects/<int:project_id>/parts/<int:part_id>', methods=['DELETE'])
def delete_part(project_id, part_id):
    # Check if project exists first
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if part exists
    part = conn.execute('SELECT * FROM parts WHERE id = ? AND project_id = ?', (part_id, project_id)).fetchone()
    if part is None:
        conn.close()
        return jsonify({"error": "Part not found"}), 404

    cursor.execute('DELETE FROM parts WHERE id = ? AND project_id = ?', (part_id, project_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Part deleted"}), 200

# Tasks
@app.route('/api/projects/<int:project_id>/tasks', methods=['GET'])
def get_tasks(project_id):
    # Check if project exists
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM tasks WHERE project_id = ?', (project_id,)).fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in tasks])

def get_task_by_id(project_id, task_id):
    """Helper function to get a task by its ID and project_id."""
    conn = get_db_connection()
    task = conn.execute('SELECT * FROM tasks WHERE id = ? AND project_id = ?', (task_id, project_id)).fetchone()
    conn.close()
    if task is None:
        return None
    return dict(task)

@app.route('/api/projects/<int:project_id>/tasks', methods=['POST'])
def create_task(project_id):
    # Check if project exists
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    new_task_data = request.get_json()
    if not new_task_data or not 'name' in new_task_data:
        return jsonify({"error": "Missing name in request body"}), 400

    name = new_task_data['name']
    description = new_task_data.get('description', '')
    start_date = new_task_data.get('start_date')
    end_date = new_task_data.get('end_date')
    status = new_task_data.get('status', 'Pending')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO tasks (project_id, name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
                   (project_id, name, description, start_date, end_date, status))
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()

    if task_id:
        created_task = get_task_by_id(project_id, task_id)
        return jsonify(created_task), 201
    else:
        return jsonify({"error": "Failed to create task"}), 500

@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>', methods=['GET'])
def get_task(project_id, task_id):
    task = get_task_by_id(project_id, task_id)
    if task:
        return jsonify(task)
    else:
        # Check if project exists to give a more specific error
        project = get_project_by_id(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify({"error": "Task not found"}), 404

@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>', methods=['PUT'])
def update_task(project_id, task_id):
    # Check if project exists first
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    updated_data = request.get_json()
    if not updated_data:
        return jsonify({"error": "Invalid JSON"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if task exists
    task = conn.execute('SELECT * FROM tasks WHERE id = ? AND project_id = ?', (task_id, project_id)).fetchone()
    if task is None:
        conn.close()
        return jsonify({"error": "Task not found"}), 404

    # Collect fields to update
    fields_to_update = {}
    if 'name' in updated_data:
        fields_to_update['name'] = updated_data['name']
    if 'description' in updated_data:
        fields_to_update['description'] = updated_data['description']
    if 'start_date' in updated_data:
        fields_to_update['start_date'] = updated_data['start_date']
    if 'end_date' in updated_data:
        fields_to_update['end_date'] = updated_data['end_date']
    if 'status' in updated_data:
        fields_to_update['status'] = updated_data['status']
    
    if not fields_to_update:
        conn.close()
        return jsonify({"error": "No fields to update"}), 400

    set_clause = ", ".join([f"{key} = ?" for key in fields_to_update.keys()])
    values = list(fields_to_update.values())
    values.append(task_id)
    values.append(project_id)

    cursor.execute(f'UPDATE tasks SET {set_clause} WHERE id = ? AND project_id = ?', tuple(values))
    conn.commit()
    conn.close()

    updated_task_data = get_task_by_id(project_id, task_id)
    return jsonify(updated_task_data)

@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(project_id, task_id):
    # Check if project exists first
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if task exists
    task = conn.execute('SELECT * FROM tasks WHERE id = ? AND project_id = ?', (task_id, project_id)).fetchone()
    if task is None:
        conn.close()
        return jsonify({"error": "Task not found"}), 404

    cursor.execute('DELETE FROM tasks WHERE id = ? AND project_id = ?', (task_id, project_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Task deleted"}), 200

# Documents
@app.route('/api/projects/<int:project_id>/documents', methods=['GET'])
def get_documents(project_id):
    # Check if project exists
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    conn = get_db_connection()
    # Fetching only id and title as per suggestion for listing multiple documents
    documents = conn.execute('SELECT id, title FROM documents WHERE project_id = ?', (project_id,)).fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in documents])

def get_document_by_id(project_id, document_id):
    """Helper function to get a document by its ID and project_id."""
    conn = get_db_connection()
    document = conn.execute('SELECT * FROM documents WHERE id = ? AND project_id = ?', (document_id, project_id)).fetchone()
    conn.close()
    if document is None:
        return None
    return dict(document)

@app.route('/api/projects/<int:project_id>/documents', methods=['POST'])
def create_document(project_id):
    # Check if project exists
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    new_document_data = request.get_json()
    if not new_document_data or not 'title' in new_document_data or 'content' not in new_document_data :
        return jsonify({"error": "Missing title or content in request body"}), 400

    title = new_document_data['title']
    content = new_document_data['content']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO documents (project_id, title, content) VALUES (?, ?, ?)',
                   (project_id, title, content))
    document_id = cursor.lastrowid
    conn.commit()
    conn.close()

    if document_id:
        # Fetching only id and title for the response of creation
        created_document_info = {"id": document_id, "title": title, "project_id": project_id}
        return jsonify(created_document_info), 201
    else:
        return jsonify({"error": "Failed to create document"}), 500

@app.route('/api/projects/<int:project_id>/documents/<int:document_id>', methods=['GET'])
def get_document(project_id, document_id):
    document = get_document_by_id(project_id, document_id)
    if document:
        return jsonify(document)
    else:
        # Check if project exists to give a more specific error
        project = get_project_by_id(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify({"error": "Document not found"}), 404

@app.route('/api/projects/<int:project_id>/documents/<int:document_id>', methods=['PUT'])
def update_document(project_id, document_id):
    # Check if project exists first
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    updated_data = request.get_json()
    if not updated_data:
        return jsonify({"error": "Invalid JSON"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if document exists
    document = conn.execute('SELECT * FROM documents WHERE id = ? AND project_id = ?', (document_id, project_id)).fetchone()
    if document is None:
        conn.close()
        return jsonify({"error": "Document not found"}), 404

    # Collect fields to update
    fields_to_update = {}
    if 'title' in updated_data:
        fields_to_update['title'] = updated_data['title']
    if 'content' in updated_data:
        fields_to_update['content'] = updated_data['content']
    
    if not fields_to_update:
        conn.close()
        return jsonify({"error": "No fields to update"}), 400

    set_clause = ", ".join([f"{key} = ?" for key in fields_to_update.keys()])
    values = list(fields_to_update.values())
    values.append(document_id)
    values.append(project_id)

    cursor.execute(f'UPDATE documents SET {set_clause} WHERE id = ? AND project_id = ?', tuple(values))
    conn.commit()
    conn.close()

    updated_document_data = get_document_by_id(project_id, document_id)
    return jsonify(updated_document_data)

@app.route('/api/projects/<int:project_id>/documents/<int:document_id>', methods=['DELETE'])
def delete_document(project_id, document_id):
    # Check if project exists first
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if document exists
    document = conn.execute('SELECT * FROM documents WHERE id = ? AND project_id = ?', (document_id, project_id)).fetchone()
    if document is None:
        conn.close()
        return jsonify({"error": "Document not found"}), 404

    cursor.execute('DELETE FROM documents WHERE id = ? AND project_id = ?', (document_id, project_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Document deleted"}), 200

# Boilerplate to run the app
if __name__ == '__main__':
    app.run(debug=True)
