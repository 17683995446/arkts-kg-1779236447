import os
import time
from typing import Optional
from src.database import Database
from src.parser import ArkTSParser


class KnowledgeGraphUpdater:
    def __init__(self, db_path: str = "knowledge_graph.db"):
        self.db = Database(db_path)
        self.parser = ArkTSParser()

    def update_file(self, file_path: str) -> bool:
        start_time = time.time()

        abs_path = os.path.abspath(file_path)
        if not os.path.exists(abs_path):
            print(f"File not found: {abs_path}")
            return False

        new_hash = self.db.compute_file_hash(abs_path)
        existing_file = self.db.get_file_by_path(abs_path)

        if existing_file:
            if existing_file['hash'] == new_hash:
                print(f"File unchanged, skipping: {abs_path}")
                return False
            else:
                print(f"Updating file: {abs_path}")
                self.db.delete_file_data(existing_file['id'])

        print(f"Parsing file: {abs_path}")
        parsed_data = self.parser.parse_file(abs_path)
        modified_time = int(os.path.getmtime(abs_path))

        file_id = self.db.insert_file(abs_path, new_hash, modified_time)

        for func in parsed_data['functions']:
            func_id = self.db.insert_function(
                file_id,
                func['name'],
                func['line_start'],
                func['line_end'],
                func['content']
            )
            for call in parsed_data.get('calls', []):
                if call.get('caller_id') == func['name']:
                    self.db.insert_call(
                        func_id,
                        func['name'],
                        call['callee_name']
                    )

        for cls in parsed_data['classes']:
            class_id = self.db.insert_class(
                file_id,
                cls['name'],
                cls['line_start'],
                cls['line_end'],
                cls['content']
            )

            if 'methods' in cls:
                for method in cls['methods']:
                    method_id = self.db.insert_class_method(
                        class_id,
                        method['name'],
                        method['line_start'],
                        method['line_end'],
                        method['content']
                    )
                    for call in parsed_data.get('calls', []):
                        if call.get('caller_name') == method['name']:
                            self.db.insert_call(
                                method_id,
                                method['name'],
                                call['callee_name']
                            )

        for imp in parsed_data['imports']:
            self.db.insert_import(file_id, imp['source'], imp['symbol'])

        elapsed_time = time.time() - start_time
        print(f"File processed in {elapsed_time:.3f}s: {abs_path}")
        return True

    def full_scan(self, directory: str):
        print(f"Starting full scan of {directory}")
        start_time = time.time()

        count = 0
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.arkts')):
                    file_path = os.path.join(root, file)
                    if self.update_file(file_path):
                        count += 1

        elapsed_time = time.time() - start_time
        print(f"Full scan complete. Processed {count} files in {elapsed_time:.2f}s")

    def close(self):
        self.db.close()
