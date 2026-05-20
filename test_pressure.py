#!/usr/bin/env python3
"""
压力测试脚本 - 测试系统的极限性能和稳定性
"""
import sys
import os
sys.path.insert(0, '/workspace')

from src.core import KnowledgeGraphUpdater
from src.database import Database
import time
import random
import string

def test_chaos_project():
    print("=" * 80)
    print("压力测试 - 复杂混乱项目")
    print("=" * 80)

    db_path = 'knowledge_graph.db'
    if os.path.exists(db_path):
        os.remove(db_path)

    updater = KnowledgeGraphUpdater(db_path)

    print("\n[1/5] 测试复杂项目扫描...")
    start_time = time.time()
    updater.full_scan('test_chaos')
    scan_time = time.time() - start_time
    print(f"扫描耗时: {scan_time:.3f}秒")

    print("\n[2/5] 统计数据库内容...")
    db = Database(db_path)
    files = db.get_all_files()

    total_functions = 0
    total_classes = 0
    total_methods = 0
    total_imports = 0

    for file_info in files:
        functions = db.get_functions_by_file(file_info['id'])
        classes = db.get_classes_by_file(file_info['id'])
        imports = db.get_imports_by_file(file_info['id'])

        file_methods = sum(len(cls.get('methods', [])) for cls in classes)

        total_functions += len(functions)
        total_classes += len(classes)
        total_methods += file_methods
        total_imports += len(imports)

    print(f"\n总体统计:")
    print(f"  - 总文件数: {len(files)}")
    print(f"  - 总函数数: {total_functions}")
    print(f"  - 总类数: {total_classes}")
    print(f"  - 总方法数: {total_methods}")
    print(f"  - 总导入数: {total_imports}")

    print("\n[3/5] 压力测试 - 连续修改...")
    test_file = 'test_chaos/utils/complex.ts'
    results = []

    for i in range(20):
        with open(test_file, 'a') as f:
            f.write(f'\n// Test modification {i}\n')

        start = time.time()
        updater.update_file(test_file)
        elapsed = (time.time() - start) * 1000
        results.append(elapsed)

        if i % 5 == 0:
            print(f"  修改 {i+1}: {elapsed:.2f}ms")

    avg_time = sum(results) / len(results)
    print(f"\n平均更新耗时: {avg_time:.2f}ms")
    print(f"最大耗时: {max(results):.2f}ms")
    print(f"最小耗时: {min(results):.2f}ms")

    print("\n[4/5] 边缘情况测试...")
    edge_cases = [
        'test_chaos/utils/empty1.ts',
        'test_chaos/utils/empty2.ts',
        'test_chaos/utils/syntaxError.ts',
        'test_chaos/utils/nonStandard.ts'
    ]

    for file in edge_cases:
        if os.path.exists(file):
            print(f"  测试: {os.path.basename(file)}")
            try:
                result = updater.update_file(file)
                print(f"    结果: {'成功' if result else '跳过'}")
            except Exception as e:
                print(f"    错误: {e}")

    print("\n[5/5] 大文件性能测试...")
    large_file = 'test_chaos/components/ui/buttons/Button.tsx'
    if os.path.exists(large_file):
        start = time.time()
        updater.update_file(large_file)
        elapsed = (time.time() - start) * 1000
        print(f"  大文件更新耗时: {elapsed:.2f}ms")

        file_size = os.path.getsize(large_file)
        print(f"  文件大小: {file_size} bytes")
        print(f"  处理速度: {file_size / elapsed:.0f} bytes/ms")

    db.close()
    updater.close()

    print("\n" + "=" * 80)
    print("压力测试完成")
    print("=" * 80)

if __name__ == "__main__":
    test_chaos_project()
