import os
import time
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from typing import Callable, Optional


class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, callback: Callable[[str], None], debounce_seconds: float = 1.0):
        self.callback = callback
        self.debounce_seconds = debounce_seconds
        self.pending_files = {}
        self.lock = threading.Lock()
        self.timer = None

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.arkts')):
            self._schedule_update(event.src_path)

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(('.ts', '.tsx', '.js', '.jsx', '.arkts')):
            self._schedule_update(event.src_path)

    def _schedule_update(self, file_path: str):
        with self.lock:
            self.pending_files[file_path] = time.time()
            if self.timer:
                self.timer.cancel()
            self.timer = threading.Timer(self.debounce_seconds, self._process_pending)
            self.timer.start()

    def _process_pending(self):
        with self.lock:
            files_to_process = list(self.pending_files.keys())
            self.pending_files.clear()
            self.timer = None

        for file_path in files_to_process:
            try:
                if os.path.exists(file_path):
                    self.callback(file_path)
            except Exception as e:
                print(f"Error processing file {file_path}: {e}")


class FileWatcher:
    def __init__(self, watch_path: str, callback: Callable[[str], None], debounce_seconds: float = 1.0):
        self.watch_path = watch_path
        self.callback = callback
        self.debounce_seconds = debounce_seconds
        self.observer = Observer()
        self.event_handler = FileChangeHandler(callback, debounce_seconds)
        self.running = False

    def start(self):
        if not self.running:
            self.observer.schedule(self.event_handler, self.watch_path, recursive=True)
            self.observer.start()
            self.running = True
            print(f"Started watching {self.watch_path}")

    def stop(self):
        if self.running:
            self.observer.stop()
            self.observer.join()
            self.running = False
            print("Stopped watching")
