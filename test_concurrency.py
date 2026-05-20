#!/usr/bin/env python3
"""
并发和竞争条件测试
"""
import sys
import os
sys.path.insert(0, '/workspace')

from src.core import KnowledgeGraphUpdater
from src.database import Database
import threading
import time
import random

class ConcurrencyTester:
    def __init__(self):
        self.updater = KnowledgeGraphUpdater()
        self.db = Database()
        self.errors = []
        self.lock = threading.Lock()

    def concurrent_update_test(self, file_path: str, iterations: int = 5):
        """测试并发更新同一个文件"""
        print(f"\n测试: 并发更新 {os.path.basename(file_path)} ({iterations} 个线程)")

        def update_worker(thread_id: int):
            try:
                for i in range(iterations):
                    result = self.updater.update_file(file_path)
                    time.sleep(random.uniform(0.01, 0.05))

                    with self.lock:
                        if result:
                            print(f"  线程 {thread_id}: 更新 {i+1} 成功")
            except Exception as e:
                with self.lock:
                    self.errors.append(f"线程 {thread_id}: {str(e)}")
                print(f"  ❌ 线程 {thread_id} 错误: {e}")

        threads = []
        for i in range(3):
            t = threading.Thread(target=update_worker, args=(i,))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        if self.errors:
            print(f"  ❌ 发现 {len(self.errors)} 个错误")
            for error in self.errors[:5]:
                print(f"     {error}")
        else:
            print(f"  ✅ 所有并发更新成功")

    def multi_file_concurrent_test(self):
        """测试并发更新多个不同文件"""
        print("\n测试: 并发更新多个文件")

        files = [
            'test_chaos/utils/complex.ts',
            'test_chaos/src/core/modules/auth/userManager.ts',
            'test_chaos/services/api/apiClient.ts',
            'test_chaos/components/ui/buttons/Button.tsx',
        ]

        def update_worker(file_path: str):
            try:
                for i in range(3):
                    result = self.updater.update_file(file_path)
                    time.sleep(random.uniform(0.01, 0.02))
                    print(f"  ✅ {os.path.basename(file_path)}: 更新 {i+1}")
            except Exception as e:
                print(f"  ❌ {os.path.basename(file_path)}: {e}")

        threads = []
        for file in files:
            t = threading.Thread(target=update_worker, args=(file,))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        print("  ✅ 多文件并发测试完成")

    def rapid_fire_test(self, file_path: str, count: int = 50):
        """快速连续触发更新"""
        print(f"\n测试: 快速连续触发 ({count} 次)")

        for i in range(count):
            try:
                self.updater.update_file(file_path)
                if (i + 1) % 10 == 0:
                    print(f"  已触发 {i+1}/{count}")
            except Exception as e:
                print(f"  ❌ 第 {i+1} 次: {e}")
                break

        print("  ✅ 快速触发测试完成")

    def database_consistency_test(self):
        """测试数据库一致性"""
        print("\n测试: 数据库一致性")

        files = self.db.get_all_files()
        print(f"  数据库中有 {len(files)} 个文件")

        for file_info in files[:5]:
            functions = self.db.get_functions_by_file(file_info['id'])
            classes = self.db.get_classes_by_file(file_info['id'])

            print(f"  {os.path.basename(file_info['path'])}:")
            print(f"    - 函数: {len(functions)}")
            print(f"    - 类: {len(classes)}")

        print("  ✅ 数据库一致性测试完成")

    def cleanup(self):
        self.updater.close()
        self.db.close()

def main():
    print("=" * 80)
    print("并发和竞争条件测试")
    print("=" * 80)

    tester = ConcurrencyTester()

    try:
        tester.concurrent_update_test('test_chaos/utils/complex.ts')
        tester.multi_file_concurrent_test()
        tester.rapid_fire_test('test_chaos/utils/complex.ts')
        tester.database_consistency_test()

        print("\n" + "=" * 80)
        print("并发测试完成")
        print("=" * 80)

    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
