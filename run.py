#!/usr/bin/env python3
"""
ArkTS 代码知识图谱系统 - 启动脚本

使用方法:
    python run.py                          # 监听当前目录，全量扫描
    python run.py ./src                    # 监听指定目录
    python run.py --watch-only             # 只监听，不全量扫描
    python run.py --no-web                 # 不启动Web服务器
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import main

if __name__ == "__main__":
    sys.exit(main())
