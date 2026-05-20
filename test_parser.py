#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/workspace')

from src.parser import ArkTSParser
import time

def test_parser():
    print("=" * 60)
    print("解析器测试")
    print("=" * 60)

    parser = ArkTSParser()

    test_file = 'test_complex_project/services/auth.ts'
    print(f"\n测试文件: {test_file}")
    result = parser.parse_file(test_file)

    print(f"\n提取结果:")
    print(f"  - 函数数量: {len(result['functions'])}")
    print(f"  - 类数量: {len(result['classes'])}")
    print(f"  - 导入数量: {len(result['imports'])}")
    print(f"  - 调用关系数量: {len(result['calls'])}")

    print("\n类详情:")
    for cls in result['classes']:
        print(f"\n  类: {cls['name']} (行 {cls['line_start']}-{cls['line_end']})")
        if 'methods' in cls:
            print(f"  方法数量: {len(cls['methods'])}")
            for method in cls['methods'][:10]:
                print(f"    - {method['name']} (行 {method['line_start']}-{method['line_end']})")
            if len(cls['methods']) > 10:
                print(f"    ... 还有 {len(cls['methods']) - 10} 个方法")
        else:
            print("  无方法信息")

if __name__ == "__main__":
    test_parser()
