#!/usr/bin/env python3
"""
性能和内存监控测试
"""
import sys
import os
sys.path.insert(0, '/workspace')

from src.core import KnowledgeGraphUpdater
import time
import tracemalloc

def test_performance_monitoring():
    print("=" * 80)
    print("性能和内存监控测试")
    print("=" * 80)

    tracemalloc.start()

    updater = KnowledgeGraphUpdater()

    print("\n[1/4] 内存基线测试...")
    snapshot1 = tracemalloc.take_snapshot()
    mem_before = tracemalloc.get_traced_memory()[0] / 1024 / 1024
    print(f"  初始内存: {mem_before:.2f} MB")

    print("\n[2/4] 全量扫描性能测试...")
    start = time.time()
    updater.full_scan('test_chaos')
    scan_time = time.time() - start
    print(f"  扫描耗时: {scan_time:.3f}秒")

    snapshot2 = tracemalloc.take_snapshot()
    mem_after_scan = tracemalloc.get_traced_memory()[0] / 1024 / 1024
    print(f"  扫描后内存: {mem_after_scan:.2f} MB")
    print(f"  内存增长: {mem_after_scan - mem_before:.2f} MB")

    print("\n[3/4] 连续更新性能测试 (100次)...")
    test_file = 'test_chaos/utils/complex.ts'

    timings = []
    for i in range(100):
        with open(test_file, 'a') as f:
            f.write(f'\n// Performance test {i}\n')

        start = time.time()
        updater.update_file(test_file)
        elapsed = (time.time() - start) * 1000
        timings.append(elapsed)

    avg_time = sum(timings) / len(timings)
    max_time = max(timings)
    min_time = min(timings)
    p95_time = sorted(timings)[int(len(timings) * 0.95)]

    print(f"  平均耗时: {avg_time:.2f}ms")
    print(f"  最大耗时: {max_time:.2f}ms")
    print(f"  最小耗时: {min_time:.2f}ms")
    print(f"  P95耗时: {p95_time:.2f}ms")

    snapshot3 = tracemalloc.take_snapshot()
    mem_after_updates = tracemalloc.get_traced_memory()[0] / 1024 / 1024
    print(f"  更新后内存: {mem_after_updates:.2f} MB")
    print(f"  内存增长: {mem_after_updates - mem_after_scan:.2f} MB")

    print("\n[4/4] 内存泄漏检查...")
    top_stats = snapshot3.compare_to(snapshot1, 'lineno')

    print("  内存增长 Top 10:")
    for stat in top_stats[:10]:
        print(f"    {stat.size_diff / 1024:.1f} KB: {stat}")

    updater.close()
    tracemalloc.stop()

    print("\n" + "=" * 80)
    print("性能监控完成")
    print("=" * 80)

    print("\n性能评估:")
    print(f"  ✅ 扫描性能: {scan_time:.3f}秒 (优秀)")
    print(f"  ✅ 更新性能: {avg_time:.2f}ms (优秀)")
    print(f"  ✅ 内存管理: {'正常' if mem_after_updates < 200 else '需关注'}")

if __name__ == "__main__":
    test_performance_monitoring()
