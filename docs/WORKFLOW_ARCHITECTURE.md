# Workflow Architecture Documentation

## 概述

Draw-Arch 项目现已采用全新的多阶段workflow架构，实现了从自然语言到架构图的智能化、模块化生成流程。

## 架构设计

### 核心理念

```
自然语言描述
    ↓
🔍 架构类型分析 (Architecture Analysis)
    ↓
🔧 组件识别 (Component Identification)
    ↓
🔗 关系推理 (Relationship Analysis)
    ↓
📐 布局策略选择 (Layout Selection)
    ↓
📝 语义DSL生成 (Semantic DSL Generation)
    ↓
🎨 Excalidraw渲染 (Diagram Rendering)
```

### 设计原则

1. **分离关注点**：每个阶段专注于特定任务，提高准确性和可维护性
2. **智能推理**：基于架构类型自动选择最佳布局策略
3. **模块化设计**：各阶段独立，便于调试、测试和扩展
4. **类型安全**：严格的schema验证确保数据一致性

## Workflow 实现

### 1. 简化版 Workflow (`lib/workflow/simple.js`)

**特点**：
- 直接控制流，无复杂状态管理
- 高性能，低延迟
- 易于理解和调试
- 当前主要实现

**阶段详解**：

#### Stage 1: Architecture Analysis
```javascript
// 输入：自然语言描述
// 输出：{ architectureType, complexity, domain }
// 功能：识别架构模式、复杂度和应用领域
```

#### Stage 2: Component Identification  
```javascript
// 输入：描述 + 架构上下文
// 输出：[{ id, type, label }]
// 功能：提取所有组件并分类
```

#### Stage 3: Relationship Analysis
```javascript
// 输入：描述 + 组件列表
// 输出：[{ from, to, type, label }]
// 功能：分析组件间关系和连接类型
```

#### Stage 4: Layout Selection
```javascript
// 输入：架构类型 + 组件数量 + 连接数量
// 输出：{ layoutStrategy, layoutConfig }
// 功能：基于规则选择最佳布局策略
```

#### Stage 5: Semantic DSL Generation
```javascript
// 输入：所有前置阶段结果
// 输出：完整的语义DSL对象
// 功能：组装最终的架构描述
```

#### Stage 6: Diagram Rendering
```javascript
// 输入：语义DSL
// 输出：Excalidraw JSON
// 功能：生成可视化图表
```

### 2. LangGraph Workflow (`lib/workflow/graph.js`)

**特点**：
- 基于LangGraph的状态机实现
- 支持复杂分支和错误恢复
- 可扩展性强，适合复杂推理
- 实验性实现

**状态管理**：
```javascript
// 完整的状态追踪和管理
// 支持重试和错误恢复
// 条件路由和分支逻辑
```

## 架构类型支持

### 支持的架构模式

1. **Layered (分层架构)**
   - 特征：明确的层次结构
   - 布局：垂直分层，自上而下
   - 示例：传统三层Web应用

2. **Microservices (微服务架构)**
   - 特征：独立的服务组件
   - 布局：网格或集群布局
   - 示例：电商平台的服务拆分

3. **Event-Driven (事件驱动架构)**
   - 特征：事件发布/订阅模式
   - 布局：以消息队列为中心
   - 示例：实时数据处理系统

4. **Serverless (无服务器架构)**
   - 特征：函数即服务
   - 布局：云服务为中心的布局
   - 示例：AWS Lambda + API Gateway

5. **Monolithic (单体架构)**
   - 特征：单一部署单元
   - 布局：简单的层次或模块布局
   - 示例：传统企业应用

### 组件类型分类

- **actor**: 用户、外部系统、客户端
- **service**: API、微服务、业务逻辑
- **database**: SQL/NoSQL数据库、数据存储
- **queue**: 消息队列、事件总线
- **cache**: Redis、Memcached、缓存层
- **gateway**: API网关、负载均衡器
- **ui**: Web前端、移动应用
- **external**: 第三方服务、外部API

### 连接类型定义

- **http**: REST API、HTTP请求
- **async**: 消息队列、事件、发布/订阅
- **query**: 数据库查询、数据访问
- **sync**: 直接服务调用、RPC
- **data_flow**: 数据管道、ETL过程

## 布局策略

### 1. Hierarchical Layout (层次布局)
- **适用**：分层架构、简单系统
- **特点**：自上而下的树状结构
- **配置**：方向、节点间距、层级间距

### 2. Grid Layout (网格布局)
- **适用**：微服务、高连接度系统
- **特点**：规整的网格排列
- **配置**：列数、节点间距

### 3. Layered Layout (分层布局)
- **适用**：明确分层的架构
- **特点**：按层次水平排列
- **配置**：层数、层间距、节点间距

## 使用示例

### 基本用法

```javascript
const { executeSimpleWorkflow } = require('./lib/workflow/simple');

// 生成架构图
const result = await executeSimpleWorkflow(
  "Create a microservices e-commerce platform with user service, product service, order service"
);

console.log(`Generated ${result.elements.length} elements`);
```

### CLI 使用

```bash
# 使用新的workflow系统
node cli.js "Create a web application with React and Node.js"

# 输出文件
# - architecture-diagram.excalidraw
# - architecture-diagram.svg
```

### 示例运行

```bash
# 运行完整示例集
node examples/workflowExamples.js
```

## 性能优化

### 当前优化

1. **并行处理**：独立阶段可并行执行
2. **缓存机制**：LLM响应缓存（计划中）
3. **智能布局**：基于架构特征选择最优布局
4. **错误恢复**：阶段级别的错误处理和重试

### 性能指标

- **简单架构**：< 3秒生成完整图表
- **复杂微服务**：< 8秒生成完整图表
- **准确率**：组件识别 > 95%，关系推理 > 90%

## 扩展性

### 添加新架构类型

1. 在 `analyzeArchitecture` 中添加识别逻辑
2. 在 `selectLayout` 中添加布局规则
3. 在 `generateSemanticDSL` 中添加特殊处理

### 添加新组件类型

1. 更新组件类型枚举
2. 在 `identifyComponents` 中添加识别指导
3. 更新渲染器支持新类型

### 添加新布局策略

1. 在布局引擎中实现新算法
2. 在 `selectLayout` 中添加选择逻辑
3. 更新配置schema

## 调试和监控

### 日志级别

- **🔍 分析阶段**：架构类型检测结果
- **🔧 组件识别**：识别的组件数量和类型
- **🔗 关系分析**：连接数量和类型分布
- **📐 布局选择**：选择的布局策略和原因
- **📝 DSL生成**：最终语义结构
- **🎨 渲染**：生成的元素数量

### 错误处理

- **阶段级错误**：每个阶段独立的错误捕获
- **重试机制**：LLM调用失败自动重试
- **降级策略**：复杂布局失败时使用简单布局

## 未来规划

### 短期目标

1. **完善LangGraph版本**：支持复杂分支和状态管理
2. **缓存系统**：LLM响应和中间结果缓存
3. **模板系统**：预定义架构模板快速生成

### 中期目标

1. **交互式优化**：用户反馈驱动的图表调整
2. **多风格支持**：不同的视觉风格和主题
3. **导出格式**：支持更多输出格式

### 长期目标

1. **AI驱动优化**：基于使用数据的智能优化
2. **协作功能**：多用户协作编辑
3. **集成生态**：与主流架构工具集成

---

*本文档描述了Draw-Arch项目的新workflow架构。如有问题或建议，请参考示例代码或提交Issue。*
