# ArkTS 代码知识图谱系统 - 使用指南

## 🚀 快速开始

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 启动系统
```bash
# 使用便捷脚本（推荐）
python run.py

# 或直接使用主程序
python main.py . --full-scan
```

### 3. 访问Web界面
打开浏览器访问: http://localhost:5000

## 📋 使用方法

### 基本用法
```bash
# 监听当前目录并全量扫描
python run.py

# 监听指定目录
python run.py ./src

# 只监听文件变化，不执行全量扫描
python run.py --watch-only

# 不启动Web服务器（仅监听）
python run.py --no-web
```

### 高级选项
```bash
# 指定Web端口
python run.py --port 8080

# 指定API密钥
python run.py --api-key your_api_key_here

# 完整示例
python run.py ./project --full-scan --port 5000
```

## 🎯 核心功能

### 1. 动态增量更新
- ✅ 自动检测文件变更
- ✅ 使用哈希判断是否真的变更
- ✅ 防抖1秒避免频繁更新
- ✅ 增量更新单个文件

### 2. 代码结构提取
- ✅ 类定义
- ✅ 类方法（public/private/static）
- ✅ 顶层函数
- ✅ 箭头函数
- ✅ 导入语句
- ✅ 函数调用关系

### 3. AI查询功能
- ✅ 基于代码结构的智能问答
- ✅ 自动提供上下文
- ✅ 支持代码解释

## 📊 性能指标

| 操作 | 耗时 | 说明 |
|------|------|------|
| 全量扫描6个文件 | 0.29秒 | 首次构建 |
| 单文件增量更新 | <50ms | 变更检测+解析 |
| 未修改文件 | <1ms | 哈希命中跳过 |

## 🔧 项目结构

```
.
├── src/                          # 源代码
│   ├── core.py                  # 核心更新逻辑
│   ├── database/                # 数据库模块
│   │   └── database.py
│   ├── parser/                  # 代码解析器
│   │   └── arkts_parser.py
│   ├── watcher/                 # 文件监听
│   │   └── file_watcher.py
│   ├── llm/                    # LLM集成
│   │   └── llm_client.py
│   └── web/                    # Web界面
│       ├── app.py
│       ├── templates/
│       └── static/
├── test_complex_project/        # 测试项目
│   ├── models/
│   ├── services/
│   └── utils/
├── main.py                     # 主程序
├── run.py                      # 启动脚本
├── requirements.txt            # 依赖
├── OPTIMIZATION_REPORT.md      # 优化报告
└── README.md                   # 项目说明
```

## 🎓 工作原理

### 1. 文件监听
使用 `watchdog` 库监控文件系统变化：
- 检测文件创建和修改事件
- 防抖机制避免连续触发
- 1秒延迟确保文件写入完成

### 2. 哈希检测
```python
# 使用SHA256计算文件指纹
file_hash = hashlib.sha256(file_content).digest()

# 对比旧哈希判断是否变更
if new_hash != old_hash:
    # 需要重新解析
```

### 3. 增量更新
```
文件变更检测
    ↓
哈希对比
    ↓ (如果变更)
删除旧数据 → 解析新代码 → 插入新数据
```

### 4. 代码解析
支持ArkTS/TypeScript语法：
- 类定义和继承
- 方法（public/private/protected/static）
- 函数声明和箭头函数
- 导入导出语句
- 接口和类型定义

## 🐛 故障排除

### 问题1: 依赖安装失败
```bash
# 使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 问题2: Web服务器无法启动
```bash
# 检查端口占用
lsof -i :5000

# 使用其他端口
python run.py --port 8080
```

### 问题3: 文件未检测到变更
- 确保文件扩展名为 `.ts`, `.tsx`, `.js`, `.jsx`, `.arkts`
- 检查文件权限
- 查看控制台日志

## 📈 扩展项目

### 添加新的测试代码
在 `test_complex_project/` 目录下添加新的 `.ts` 文件，系统会自动检测。

### 自定义解析规则
修改 `src/parser/arkts_parser.py` 中的正则表达式。

### 集成其他LLM
修改 `src/llm/llm_client.py` 中的API调用。

## 🎉 示例输出

### 控制台输出
```
============================================================
ArkTS 代码知识图谱系统
============================================================

1. 执行全量扫描...
Starting full scan of test_complex_project
Parsing file: /workspace/test_complex_project/services/auth.ts
File processed in 0.047s: /workspace/test_complex_project/services/auth.ts
Parsing file: /workspace/test_complex_project/services/order.ts
File processed in 0.038s: /workspace/test_complex_project/services/order.ts
Full scan complete. Processed 6 files in 0.29s

2. 启动文件监听: /workspace/test_complex_project

系统已启动，按 Ctrl+C 停止
```

### Web界面
- 左侧显示文件列表
- 点击文件查看代码结构（类、方法）
- 底部支持AI查询

## 📞 支持

如遇问题，请检查：
1. Python版本 >= 3.7
2. 依赖是否完整安装
3. 文件扩展名是否正确
4. 文件权限是否足够

## 🎯 设计理念

基于第一性原理：
> 改完代码0.5秒后，AI就能查到最新内容。不用等8分钟重新解析整个项目。

三条铁则：
1. **只改变了的** - 哪个文件改了，就只更新哪个
2. **删了再加** - 先删旧数据，再插新数据
3. **等你停手再更** - 防抖1秒，避免频繁更新

---

**享受高效的代码知识图谱体验！** 🚀
