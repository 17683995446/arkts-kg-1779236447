#!/usr/bin/env python3
"""
边缘情况和边界测试
"""
import sys
import os
sys.path.insert(0, '/workspace')

from src.parser import ArkTSParser
from src.core import KnowledgeGraphUpdater
import traceback

def test_edge_cases():
    print("=" * 80)
    print("边缘情况测试")
    print("=" * 80)

    parser = ArkTSParser()
    updater = KnowledgeGraphUpdater()

    test_cases = [
        ('test_chaos/utils/empty1.ts', '空文件'),
        ('test_chaos/utils/empty2.ts', '只有注释'),
        ('test_chaos/utils/syntaxError.ts', '语法错误'),
        ('test_chaos/utils/nonStandard.ts', '非标准格式'),
        ('test_chaos/utils/complex.ts', '复杂嵌套'),
        ('test_chaos/services/api/apiClient.ts', '特殊字符'),
        ('test_chaos/src/core/types/common.ts', '大量接口'),
        ('test_chaos/src/core/modules/auth/userManager.ts', '循环依赖'),
    ]

    print("\n[1/3] 测试解析器边缘情况...")
    for file_path, description in test_cases:
        print(f"\n测试: {description} ({os.path.basename(file_path)})")
        print("-" * 60)

        try:
            if not os.path.exists(file_path):
                print(f"  ❌ 文件不存在")
                continue

            result = parser.parse_file(file_path)

            print(f"  ✅ 解析成功")
            print(f"     - 函数: {len(result['functions'])}")
            print(f"     - 类: {len(result['classes'])}")
            print(f"     - 导入: {len(result['imports'])}")
            print(f"     - 调用: {len(result['calls'])}")

            if result['classes']:
                print(f"     类列表:")
                for cls in result['classes'][:3]:
                    methods_count = len(cls.get('methods', []))
                    print(f"       - {cls['name']} ({methods_count} 方法)")

            if result['functions']:
                print(f"     函数列表:")
                for func in result['functions'][:5]:
                    print(f"       - {func['name']}")

        except Exception as e:
            print(f"  ❌ 解析失败: {e}")
            print(f"     {traceback.format_exc()}")

    print("\n[2/3] 测试更新器处理错误文件...")
    error_files = [
        'test_chaos/utils/syntaxError.ts',
        'test_chaos/utils/nonStandard.ts',
    ]

    for file_path in error_files:
        print(f"\n更新: {os.path.basename(file_path)}")
        try:
            result = updater.update_file(file_path)
            print(f"  结果: {'成功' if result else '跳过'}")
        except Exception as e:
            print(f"  ❌ 更新失败: {e}")

    print("\n[3/3] 验证特殊字符处理...")
    special_chars_file = 'test_chaos/services/api/apiClient.ts'
    if os.path.exists(special_chars_file):
        print("测试包含Emoji和特殊字符的文件...")
        try:
            result = parser.parse_file(special_chars_file)
            print(f"  ✅ 成功解析特殊字符")
            print(f"     提取了 {len(result['classes'])} 个类")
        except Exception as e:
            print(f"  ❌ 特殊字符处理失败: {e}")

    updater.close()

    print("\n" + "=" * 80)
    print("边缘情况测试完成")
    print("=" * 80)

if __name__ == "__main__":
    test_edge_cases()
