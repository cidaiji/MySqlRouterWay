# Way 框架项目

![Way Logo](StartMap/Logo/logo.png)

## 简介
Way 是一个首创使用 `.way` 文件来管理服务器的创新型框架。通过 `.ini` 配置文件和自研的 `Routerjs` 组件，实现多服务和目录的聚合管理。每个 JavaScript 服务器功能独立，借助首创的 `SqlWay.js` 进行服务器管理与进程守护。同时，结合 `bun` 运行时和静态文件内存缓存机制，实测性能可达约 7000 次请求每秒。

## 核心优势
### 架构创新
- **`.way` 文件管理**：首创的 `.way` 文件格式，将服务器配置与业务逻辑深度整合，提升配置管理效率。
- **多服务聚合**：通过 `.ini` 文件和 `Routerjs` 实现服务动态加载与路由，支持灵活扩展。

### 性能优化
- **`bun` 运行时**：利用 `bun` 的高性能特性，显著提升代码执行速度。
- **内存缓存**：静态文件内存缓存机制，减少磁盘 I/O，加速资源访问。

### 运维便利
- **进程守护**：`SqlWay.js` 提供自动重启和故障恢复功能，保障服务稳定性。
- **集群控制**：支持对子集群进行统一管理和指令操作。

## 技术栈
- **运行时**：`bun` >= 1.0.0、Node.js >= 16.0.0
- **配置文件**：`.ini`、`.way`
- **核心组件**：`Routerjs`、`SqlWay.js`
- **数据库**：MySQL（支持扩展）

## 安装指南
### 环境准备
确保系统已安装以下软件：
```bash
# 检查 bun 版本
bun --version
# 检查 Node.js 版本
node -v
```
若未安装 `bun`，可通过以下命令安装：
```bash
curl -fsSL https://bun.sh/install | bash
```

### 项目初始化
1. 克隆项目仓库：
```bash
# 替换为实际仓库地址
git clone https://your-repo-url.git
cd your-project-folder
```
2. 安装依赖：
```bash
bun install
```

## 配置说明
项目配置文件位于 `Conf` 目录下，各文件作用如下：
### `Database.ini`
```ini
[数据库配置]
host = localhost
port = 3306
user = root
password = your_password
database = LNK
```
该文件用于配置数据库连接信息，子服务器启动时会读取此配置并入路由。

### `ServerList.ini`
```ini
[服务列表]
服务1 = ./path/to/service1.js
服务2 = ./path/to/service2.js
```
配置需要启动的 JavaScript 服务路径。

### `Start.ini`
```ini
[核心服务]
核心服务1 = ./path/to/core-service1.js
核心服务2 = ./path/to/core-service2.js
```
配置特别重要的核心服务，系统启动时优先加载。

## EXE 插件配置
在 `ExePlugs` 目录下：
- `Exes` 目录：可放置 `minio.exe` 等可执行文件。
- `Tooljs/Conf` 目录：配置可执行文件的启动参数。示例 `ExeStartList.ini`：
```ini
[minio]
path = ./ExePlugs/Exes/minio.exe
args = server ./data
```

## 命令行操作
以下是可用的服务器指令，可通过命令行对子集群进行控制：
```bash
# 显示帮助信息
help
# 显示所有服务状态
list
# 启动指定服务
start 服务名
# 停止所有服务
stop all
# 重启服务并查看日志
restart 服务名 && logs 服务名
```

## 性能测试
项目使用 `k6` 进行性能测试，测试脚本示例：
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 200,
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:8080/api/test');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
};
```
运行测试：
```bash
k6 run script.js
```

## 错误处理
项目提供了以下错误页面：
- `Error/404.html`：资源未找到错误
- `Error/500.html`：服务器内部错误
- `Error/503.html`：服务不可用错误

## 贡献指南
1. Fork 项目仓库
2. 创建新分支：`git checkout -b feature/new-feature`
3. 提交代码：`git commit -m "Add new feature"`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 协议
本项目采用 [MIT 协议](LICENSE) 进行许可。

## 作者
作者：枕知意
版本：V1.0

## 联系方式
如有问题或建议，欢迎通过以下方式联系：
- 邮箱：q@cidaiji.com
