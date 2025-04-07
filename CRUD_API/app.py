from flask import Flask, render_template, request, jsonify
import requests
import sqlite3

app = Flask(__name__)

# Inisialisasi database komentar
def init_db():
    conn = sqlite3.connect('comments.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id TEXT,
            content TEXT
        )
    ''')
    conn.close()

init_db()

@app.route('/search')
def search_characters():
    query = request.args.get('query', '')
    res = requests.get(f'https://api.disneyapi.dev/character?name={query}')
    results = res.json().get("data", [])
    return jsonify(results)


@app.route('/')
def index():
    res = requests.get('https://api.disneyapi.dev/character?page=1')
    data = res.json().get("data", [])
    return render_template('index.html', characters=data)

@app.route('/character/<id>')
def character_detail(id):
    return render_template('detail.html', character_id=id)

@app.route('/api/character/<id>')
def get_character(id):
    res = requests.get(f'https://api.disneyapi.dev/character/{id}')
    return jsonify(res.json())

@app.route('/api/comments/<movie_id>')
def get_comments(movie_id):
    conn = sqlite3.connect('comments.db')
    cur = conn.cursor()
    cur.execute('SELECT id, content FROM comments WHERE movie_id=?', (movie_id,))
    comments = [{'id': row[0], 'content': row[1]} for row in cur.fetchall()]
    conn.close()
    return jsonify(comments)

@app.route('/api/comments', methods=['POST'])
def add_comment():
    data = request.json
    conn = sqlite3.connect('comments.db')
    conn.execute('INSERT INTO comments (movie_id, content) VALUES (?, ?)', (data['movie_id'], data['content']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Comment added successfully'})

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
def edit_comment(comment_id):
    data = request.json
    new_content = data.get('content')
    if not new_content:
        return jsonify({'error': 'Content required'}), 400
    conn = sqlite3.connect('comments.db')
    conn.execute('UPDATE comments SET content=? WHERE id=?', (new_content, comment_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Comment updated'})

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    conn = sqlite3.connect('comments.db')
    conn.execute('DELETE FROM comments WHERE id=?', (comment_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Comment deleted'})

if __name__ == '__main__':
    app.run(debug=True)
