#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/workspace')

from src.core import KnowledgeGraphUpdater
from src.database import Database
import time

def test_system():
    print("=" * 60)
    print("系统测试脚本")
    print("=" * 60)

    updater = KnowledgeGraphUpdater()

    print("\n1. 执行全量扫描...")
    start_time = time.time()
    updater.full_scan('test_complex_project')
    scan_time = time.time() - start_time
    print(f"扫描耗时: {scan_time:.3f}秒")

    print("\n2. 检查数据库内容...")
    db = Database()
    files = db.get_all_files()
    print(f"数据库中的文件数量: {len(files)}")

    for file_info in files:
        print(f"\n文件: {file_info['path']}")
        print(f"  - ID: {file_info['id']}")
        print(f"  - 哈希: {file_info['hash'].hex()[:16]}...")
        print(f"  - 修改时间: {file_info['modified']}")

        functions = db.get_functions_by_file(file_info['id'])
        classes = db.get_classes_by_file(file_info['id'])
        imports = db.get_imports_by_file(file_info['id'])

        print(f"  - 函数数量: {len(functions)}")
        print(f"  - 类数量: {len(classes)}")
        print(f"  - 导入数量: {len(imports)}")

        if functions:
            print("  函数列表:")
            for func in functions[:3]:
                print(f"    - {func['name']} (行 {func['line_start']}-{func['line_end']})")
            if len(functions) > 3:
                print(f"    ... 还有 {len(functions) - 3} 个函数")

        if classes:
            print("  类列表:")
            for cls in classes[:3]:
                print(f"    - {cls['name']} (行 {cls['line_start']}-{cls['line_end']})")
            if len(classes) > 3:
                print(f"    ... 还有 {len(classes) - 3} 个类")

    print("\n3. 测试单个文件更新...")
    test_file = "test_complex_project/models/user.ts"
    if os.path.exists(test_file):
        start_time = time.time()
        updater.update_file(test_file)
        update_time = time.time() - start_time
        print(f"更新耗时: {update_time:.3f}秒")

    print("\n4. 测试未修改文件跳过...")
    start_time = time.time()
    updater.update_file(test_file)
    update_time = time.time() - start_time
    print(f"未修改文件处理耗时: {update_time:.3f}秒")

    print("\n5. 验证文件哈希检测...")
    with open(test_file, 'a') as f:
        f.write('\n// Test modification\n')

    start_time = time.time()
    updater.update_file(test_file)
    update_time = time.time() - start_time
    print(f"修改后文件处理耗时: {update_time:.3f}秒")

    db.close()
    updater.close()

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_system()
