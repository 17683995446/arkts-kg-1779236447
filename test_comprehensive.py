#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/workspace')

from src.core import KnowledgeGraphUpdater
from src.database import Database
import time

def comprehensive_test():
    print("=" * 70)
    print("完整系统测试 - 第2轮")
    print("=" * 70)

    db_path = 'knowledge_graph.db'
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"已删除旧的数据库: {db_path}")

    updater = KnowledgeGraphUpdater(db_path)

    print("\n1. 执行全量扫描...")
    start_time = time.time()
    updater.full_scan('test_complex_project')
    scan_time = time.time() - start_time
    print(f"扫描总耗时: {scan_time:.3f}秒")

    print("\n2. 检查数据库内容...")
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

        print(f"\n文件: {file_info['path'].split('/')[-1]}")
        print(f"  路径: {file_info['path']}")
        print(f"  函数: {len(functions)}")
        print(f"  类: {len(classes)}")
        print(f"  方法: {file_methods}")

        if classes:
            print("  类和方法:")
            for cls in classes[:3]:
                print(f"    {cls['name']}:")
                methods = cls.get('methods', [])
                for method in methods[:5]:
                    print(f"      - {method['name']}")
                if len(methods) > 5:
                    print(f"      ... 还有 {len(methods) - 5} 个方法")

    print("\n" + "=" * 70)
    print("总体统计:")
    print(f"  总文件数: {len(files)}")
    print(f"  总函数数: {total_functions}")
    print(f"  总类数: {total_classes}")
    print(f"  总方法数: {total_methods}")
    print(f"  总导入数: {total_imports}")
    print("=" * 70)

    print("\n3. 性能测试...")
    test_file = "test_complex_project/models/user.ts"

    print("  a. 未修改文件:")
    start = time.time()
    updater.update_file(test_file)
    print(f"     耗时: {(time.time() - start)*1000:.2f}ms (应该接近0)")

    with open(test_file, 'a') as f:
        f.write('\n// Test\n')

    print("  b. 修改后文件:")
    start = time.time()
    updater.update_file(test_file)
    print(f"     耗时: {(time.time() - start)*1000:.2f}ms")

    print("\n4. 验证哈希检测...")
    with open(test_file, 'r') as f:
        content = f.read()
    content = content.rsplit('\n// Test\n', 1)[0]
    with open(test_file, 'w') as f:
        f.write(content)

    start = time.time()
    updater.update_file(test_file)
    elapsed = (time.time() - start) * 1000
    print(f"  再次修改文件耗时: {elapsed:.2f}ms")

    db.close()
    updater.close()

    print("\n" + "=" * 70)
    print("测试完成！")
    print("=" * 70)

if __name__ == "__main__":
    comprehensive_test()
