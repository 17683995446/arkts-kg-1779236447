# 🚀 快速参考卡片

## 常用命令

### 启动系统
```bash
# 标准启动（推荐）
python run.py

# 带全量扫描
python run.py --full-scan

# 指定目录
python run.py ./src

# 不启动Web
python run.py --no-web
```

### 测试命令
```bash
# 单元测试
python test_system.py

# 综合测试
python test_comprehensive.py

# 解析器测试
python test_parser.py
```

### Web访问
```
http://localhost:5000
```

## 核心参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| --port | 5000 | Web服务端口 |
| --full-scan | False | 启动时全量扫描 |
| --no-web | False | 不启动Web服务 |
| --no-watch | False | 不启动文件监听 |

## 性能指标

- ✅ 单文件更新: <50ms
- ✅ 全量扫描: <1秒
- ✅ 哈希检测: <1ms
- ✅ 内存占用: <50MB

## 项目文件

```
ArkTS代码知识图谱/
├── src/                      # 源代码
│   ├── core.py              # 核心逻辑
│   ├── database/            # 数据库
│   ├── parser/              # 解析器
│   ├── watcher/             # 文件监听
│   ├── llm/                 # LLM集成
│   └── web/                 # Web界面
├── test_complex_project/    # 测试项目
├── 文档
│   ├── README.md
│   ├── USER_GUIDE.md
│   ├── OPTIMIZATION_REPORT.md
│   └── PROJECT_SUMMARY.md
├── main.py                  # 主程序
├── run.py                   # 启动脚本
└── requirements.txt         # 依赖
```

## API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| / | GET | Web首页 |
| /api/files | GET | 获取所有文件 |
| /api/file/<id> | GET | 获取文件详情 |
| /api/query | POST | AI查询 |

## 数据库表

- **files**: 文件信息（路径、哈希、修改时间）
- **functions**: 顶层函数
- **classes**: 类定义
- **class_methods**: 类方法
- **imports**: 导入语句
- **calls**: 函数调用关系

## 设计原则

1. **只改变了的** - 增量更新
2. **删了再加** - 先删后插
3. **等你停手再更** - 防抖1秒

## 故障排查

### 无法启动
```bash
# 检查Python版本
python --version  # 需要 3.7+

# 安装依赖
pip install -r requirements.txt
```

### Web无法访问
```bash
# 检查端口占用
lsof -i :5000

# 使用其他端口
python run.py --port 8080
```

### 文件未检测
- 检查文件扩展名 (.ts, .tsx, .js, .jsx, .arkts)
- 检查文件权限
- 查看控制台日志

## 技术栈

- **Python**: 3.7+
- **Flask**: Web框架
- **SQLite**: 数据库
- **Watchdog**: 文件监听
- **Silicon Flow**: LLM API

## 版本信息

- **项目版本**: 1.0.0
- **Python版本**: 3.7+
- **最后更新**: 2024年

## 支持

有问题？查阅：
1. USER_GUIDE.md - 详细指南
2. OPTIMIZATION_REPORT.md - 优化过程
3. PROJECT_SUMMARY.md - 项目总结

---

💡 **提示**: 运行 `python run.py --help` 查看所有可用选项
