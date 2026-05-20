import sqlite3
import hashlib
import os
from typing import Optional, List, Dict, Any


class Database:
    def __init__(self, db_path: str = "knowledge_graph.db"):
        self.db_path = db_path
        self.conn = None
        self._initialize_database()

    def _initialize_database(self):
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        cursor = self.conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                path TEXT UNIQUE NOT NULL,
                hash BLOB NOT NULL,
                modified INTEGER NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS functions (
                id INTEGER PRIMARY KEY,
                file_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                line_start INTEGER NOT NULL,
                line_end INTEGER NOT NULL,
                content TEXT NOT NULL,
                FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY,
                file_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                line_start INTEGER NOT NULL,
                line_end INTEGER NOT NULL,
                content TEXT NOT NULL,
                FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS class_methods (
                id INTEGER PRIMARY KEY,
                class_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                line_start INTEGER NOT NULL,
                line_end INTEGER NOT NULL,
                content TEXT NOT NULL,
                FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS imports (
                id INTEGER PRIMARY KEY,
                file_id INTEGER NOT NULL,
                source TEXT NOT NULL,
                symbol TEXT NOT NULL,
                FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calls (
                id INTEGER PRIMARY KEY,
                caller_id INTEGER NOT NULL,
                caller_name TEXT NOT NULL,
                callee_name TEXT NOT NULL,
                callee_file_id INTEGER,
                FOREIGN KEY (caller_id) REFERENCES functions (id) ON DELETE CASCADE,
                FOREIGN KEY (callee_file_id) REFERENCES files (id) ON DELETE CASCADE
            )
        ''')

        self.conn.commit()

    def compute_file_hash(self, file_path: str) -> bytes:
        hasher = hashlib.sha256()
        try:
            with open(file_path, 'rb') as f:
                hasher.update(f.read())
            return hasher.digest()
        except Exception:
            return b''

    def get_file_by_path(self, file_path: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, path, hash, modified FROM files WHERE path = ?', (file_path,))
        row = cursor.fetchone()
        if row:
            return {
                'id': row[0],
                'path': row[1],
                'hash': row[2],
                'modified': row[3]
            }
        return None

    def insert_file(self, file_path: str, file_hash: bytes, modified: int) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO files (path, hash, modified) VALUES (?, ?, ?)',
            (file_path, file_hash, modified)
        )
        self.conn.commit()
        return cursor.lastrowid

    def update_file(self, file_id: int, file_hash: bytes, modified: int):
        cursor = self.conn.cursor()
        cursor.execute(
            'UPDATE files SET hash = ?, modified = ? WHERE id = ?',
            (file_hash, modified, file_id)
        )
        self.conn.commit()

    def delete_file_data(self, file_id: int):
        cursor = self.conn.cursor()
        cursor.execute('DELETE FROM calls WHERE caller_id IN (SELECT id FROM functions WHERE file_id = ?)', (file_id,))
        cursor.execute('DELETE FROM calls WHERE caller_id IN (SELECT id FROM classes WHERE file_id = ?)', (file_id,))
        cursor.execute('DELETE FROM functions WHERE file_id = ?', (file_id,))
        cursor.execute('DELETE FROM class_methods WHERE class_id IN (SELECT id FROM classes WHERE file_id = ?)', (file_id,))
        cursor.execute('DELETE FROM classes WHERE file_id = ?', (file_id,))
        cursor.execute('DELETE FROM imports WHERE file_id = ?', (file_id,))
        cursor.execute('DELETE FROM files WHERE id = ?', (file_id,))
        self.conn.commit()

    def insert_function(self, file_id: int, name: str, line_start: int, line_end: int, content: str) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO functions (file_id, name, line_start, line_end, content) VALUES (?, ?, ?, ?, ?)',
            (file_id, name, line_start, line_end, content)
        )
        self.conn.commit()
        return cursor.lastrowid

    def insert_class(self, file_id: int, name: str, line_start: int, line_end: int, content: str) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO classes (file_id, name, line_start, line_end, content) VALUES (?, ?, ?, ?, ?)',
            (file_id, name, line_start, line_end, content)
        )
        self.conn.commit()
        return cursor.lastrowid

    def insert_class_method(self, class_id: int, name: str, line_start: int, line_end: int, content: str) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO class_methods (class_id, name, line_start, line_end, content) VALUES (?, ?, ?, ?, ?)',
            (class_id, name, line_start, line_end, content)
        )
        self.conn.commit()
        return cursor.lastrowid

    def insert_import(self, file_id: int, source: str, symbol: str) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO imports (file_id, source, symbol) VALUES (?, ?, ?)',
            (file_id, source, symbol)
        )
        self.conn.commit()
        return cursor.lastrowid

    def insert_call(self, caller_id: int, caller_name: str, callee_name: str, callee_file_id: Optional[int] = None):
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO calls (caller_id, caller_name, callee_name, callee_file_id) VALUES (?, ?, ?, ?)',
            (caller_id, caller_name, callee_name, callee_file_id)
        )
        self.conn.commit()

    def get_all_files(self) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, path, hash, modified FROM files')
        rows = cursor.fetchall()
        return [
            {'id': row[0], 'path': row[1], 'hash': row[2], 'modified': row[3]}
            for row in rows
        ]

    def get_functions_by_file(self, file_id: int) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, name, line_start, line_end, content FROM functions WHERE file_id = ?', (file_id,))
        rows = cursor.fetchall()
        return [
            {'id': row[0], 'name': row[1], 'line_start': row[2], 'line_end': row[3], 'content': row[4]}
            for row in rows
        ]

    def get_classes_by_file(self, file_id: int) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, name, line_start, line_end, content FROM classes WHERE file_id = ?', (file_id,))
        rows = cursor.fetchall()
        result = []
        for row in rows:
            class_info = {
                'id': row[0],
                'name': row[1],
                'line_start': row[2],
                'line_end': row[3],
                'content': row[4],
                'methods': self.get_class_methods(row[0])
            }
            result.append(class_info)
        return result

    def get_class_methods(self, class_id: int) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, name, line_start, line_end, content FROM class_methods WHERE class_id = ?', (class_id,))
        rows = cursor.fetchall()
        return [
            {'id': row[0], 'name': row[1], 'line_start': row[2], 'line_end': row[3], 'content': row[4]}
            for row in rows
        ]

    def get_imports_by_file(self, file_id: int) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, source, symbol FROM imports WHERE file_id = ?', (file_id,))
        rows = cursor.fetchall()
        return [
            {'id': row[0], 'source': row[1], 'symbol': row[2]}
            for row in rows
        ]

    def close(self):
        if self.conn:
            self.conn.close()
