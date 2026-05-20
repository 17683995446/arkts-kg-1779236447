# 动态更新版ArkTS→SQLite代码知识图谱

基于第一性原理设计的动态更新代码知识图谱系统。

## 核心特性

- **增量更新**：只更新变更的文件，0.5秒内完成
- **智能检测**：文件指纹判断内容是否真的变更
- **防抖处理**：连续打字时不更新，等停手1秒后再更

## 项目结构

```
.
├── src/
│   ├── __init__.py
│   ├── database/      # 数据库模块
│   ├── parser/        # ArkTS解析器
│   ├── watcher/       # 文件监听
│   ├── llm/           # LLM集成
│   └── web/           # 可视化网站
├── requirements.txt
└── main.py
```

## 快速开始

1. 安装依赖：`pip install -r requirements.txt`
2. 运行程序：`python main.py`

## API密钥

使用硅基流动的免费模型，API密钥已配置。
