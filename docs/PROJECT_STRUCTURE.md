# 项目结构说明

## 目录结构

```
draw-arch/
├── index.js                    # 主入口文件
├── cli.js                      # 命令行工具
├── package.json               # 项目配置
├── README.md                  # 项目说明
├── .env.example              # 环境变量示例
│
├── lib/                       # 核心库文件
│   ├── main.js                # 主生成器（统一入口）
│   │
│   ├── core/                  # 核心模块
│   │   ├── schema.js          # 架构DSL定义
│   │   ├── layout.js          # 布局引擎
│   │   ├── renderer.js        # Excalidraw渲染器
│   │   └── svg.js             # SVG转换工具
│   │
│   └── semantic/              # 语义生成模块
│       ├── generator.js       # 语义架构生成器
│       ├── tools.js           # 语义工具类
│       └── agent.js           # ReAct Agent
│
├── docs/                      # 文档和示例
│   ├── PROJECT_STRUCTURE.md   # 项目结构说明（本文件）
│   └── examples/              # 使用示例
│       └── semanticExamples.js
│
├── tests/                     # 测试文件
│   └── test.js
│
└── output/                    # 生成的文件输出目录
```

## 模块说明

### 核心模块 (lib/core/)

- **schema.js**: 定义语义架构描述语言，包括节点类型、连接类型、样式配置
- **layout.js**: 自动布局引擎，支持层次布局、网格布局、分层布局
- **renderer.js**: 将布局数据渲染为Excalidraw格式
- **svg.js**: 将Excalidraw数据转换为SVG格式

### 语义生成模块 (lib/semantic/)

- **generator.js**: 主要的语义架构生成器
- **tools.js**: 为LLM Agent提供的高级工具
- **agent.js**: ReAct Agent配置，专注语义生成

## 使用方式

### 1. 作为库使用

```javascript
const { generateArchitectureDiagramSemantic } = require('draw-arch');

const architecture = {
  nodes: [
    { id: 'user', type: 'actor', label: 'User' },
    { id: 'api', type: 'service', label: 'API Server' }
  ],
  connections: [
    { from: 'user', to: 'api', type: 'http', label: 'Request' }
  ]
};

const diagram = await generateArchitectureDiagramSemantic(architecture);
```

### 2. 命令行使用

```bash
# 自然语言生成
node cli.js "Create a web app with React and Node.js"

# 模板生成
node cli.js --template microservices

# 运行测试
node cli.js --test
```

## 架构优势

### 1. 极简分层架构
- **Core**: 核心算法和数据结构
- **Semantic**: 高级语义接口

### 2. 关注点分离
- **Schema**: 语义描述与技术实现分离
- **Layout**: 布局算法与渲染分离
- **Renderer**: 渲染逻辑与输出格式分离

### 3. 高度精简
- 删除所有冗余代码和遗留模块
- 简洁的文件命名，易于理解
- 专注核心功能，提升可维护性

## 开发指南

### 添加新的节点类型
1. 在 `lib/core/schema.js` 中添加节点类型定义
2. 在 `NODE_STYLES` 中添加视觉样式
3. 更新相关的Zod schema

### 添加新的布局算法
1. 在 `lib/core/layout.js` 中实现新的布局方法
2. 在 `generateLayout` 方法中添加分支逻辑

### 添加新的输出格式
1. 创建新的渲染器（参考 `renderer.js`）
2. 在主生成器中集成新的渲染器

## 测试

运行所有测试：
```bash
npm test
# 或
node cli.js --test
```

测试文件位于 `tests/test.js`，包含完整的端到端测试用例。
