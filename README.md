# AI 专业修图台

面向专业修图师、设计师、电商视觉和摄影后期的 AI Native 修图工作台。项目基于 [CookSleep/gpt_image_playground](https://github.com/CookSleep/gpt_image_playground) 二次开发，保留图像生成、图生图、遮罩编辑、多 API 配置和历史管理能力，并重构为更适合专业修图工作流的中文界面。

生产地址：[https://image.simplaj.top/](https://image.simplaj.top/)

推荐 API 中转：[https://sub2api.simplaj.top/](https://sub2api.simplaj.top/)

顶部中转站入口可配置，默认指向上面的地址；私有部署时可以换成自己的中转站或购买页。

## 当前版本重点

- 专业修图工作台：固定屏幕工作区，左侧功能预设，中间大画布预览，右侧主交互区和历史记录。
- 文生图 / 图生图：右侧支持模式切换；文生图提交时不会携带参考图或 mask，图生图保留参考图修图链路。
- 专业预设：人像、丰体、瘦身、背景修复、皮肤美化、全局美化、人像调色、衣物、裁剪、AI Native 等分类。
- 多选叠加：预设小功能支持多选叠加，并自动映射为结构化中文 prompt。
- 强度和对象：支持轻微、标准、明显、强烈，以及自动、女性、男性、儿童、产品/物体等对象设置。
- 局部修图：支持涂抹指定区域生成 mask，作为局部重绘参考。
- 对比和缩放：支持前后对比线、完整显示、无级缩放和大图查看。
- 修图历史：任务提交后自动记录历史，支持回看输出和任务状态。
- 输出控制：支持 1 张 / 4 版、1K / 2K / 4K、快速 / 标准 / 精修、PNG / WebP / JPEG。
- API 代理：Cloudflare Pages Function 内置 `/api-proxy/`，默认转发到 `https://sub2api.simplaj.top/v1`，用于减少浏览器跨域问题。
- 可配置推广入口：顶部中转站 URL 和文案可通过环境变量修改，不再写死在界面组件里。

## 界面预览

![AI 专业修图台](public/retouch-studio-sample.png)

## 快速开始

```bash
npm install
npm run dev
```

本地默认地址：

```text
http://127.0.0.1:5173/
```

构建生产产物：

```bash
npm run build
```

运行测试：

```bash
npm test
```

## API 配置

应用默认使用 OpenAI 兼容接口，默认 API 地址为：

```text
https://sub2api.simplaj.top/
```

用户可以在页面右上角的 API 设置中修改：

- API 地址
- API Key
- 模型 ID
- API 模式
- 是否启用代理
- 输出尺寸、质量、格式等参数

没有 API 时，页面顶部和 API 设置区域会引导到：

```text
https://simplaj-docs.pages.dev/
```

### 顶部中转站入口配置

默认顶部入口显示：

```text
https://sub2api.simplaj.top/ 稳定API中转站，注册送5刀，可免费修10张图
```

如果要换成自己的中转站、购买页或文档页，可以在构建时配置：

```bash
VITE_PROMO_API_URL=https://your-gateway.example.com/ \
VITE_PROMO_API_LABEL=我的中转站 \
npm run build
```

这只影响顶部宣传入口的跳转和显示文案，不会修改真实模型请求地址。真实请求地址仍由 `VITE_DEFAULT_API_URL`、页面 API 设置、`API_PROXY_URL` 或用户手动配置控制。

### Cloudflare Pages API 代理

当前仓库包含 Pages Function：

```text
functions/api-proxy/[[path]].ts
```

代理规则：

- 前端请求 `/api-proxy/images/generations` 等路径。
- Pages Function 默认转发到 `https://sub2api.simplaj.top/v1`。
- 私有 Pages 部署可通过环境变量 `API_PROXY_URL=https://your-gateway.example.com/v1` 修改默认代理上游。
- 请求头 `x-aipic-upstream` 可以覆盖上游地址，但只接受 HTTPS。
- 代理返回 CORS 头，方便浏览器直接调用。

注意：代理只负责转发请求，不保存 API Key，不记录图片数据。

## Docker 一键部署

Docker 版本适合本地服务器、NAS、轻量云服务器或内网工作站部署。容器会用 Nginx 托管前端，并内置同源 API 代理：

- 页面访问地址：`http://服务器IP:8080/`
- 默认 API 地址：`https://sub2api.simplaj.top/`
- 默认代理上游：`https://sub2api.simplaj.top/v1`
- 浏览器只请求本机 `/api-proxy/`，由容器内 Nginx 转发到模型 API，减少 CORS 问题。

### 方式一：Docker Compose

克隆项目后，在项目目录执行：

```bash
docker compose up -d --build
```

启动后访问：

```text
http://127.0.0.1:8080/
```

如果部署在服务器上，把 `127.0.0.1` 换成服务器 IP 或域名。

查看运行状态：

```bash
docker compose ps
docker compose logs -f aipic
```

停止服务：

```bash
docker compose down
```

### 方式二：docker run

构建镜像：

```bash
docker build -f deploy/Dockerfile -t aipic:local .
```

启动容器：

```bash
docker run -d \
  --name aipic \
  --restart unless-stopped \
  -p 8080:80 \
  -e DEFAULT_API_URL=https://sub2api.simplaj.top/ \
  -e API_PROXY_URL=https://sub2api.simplaj.top/v1 \
  -e ENABLE_API_PROXY=true \
  -e LOCK_API_PROXY=true \
  -e PROMO_API_URL=https://sub2api.simplaj.top/ \
  -e PROMO_API_LABEL=稳定API中转站，注册送5刀，可免费修10张图 \
  aipic:local
```

查看日志：

```bash
docker logs -f aipic
```

停止并删除容器：

```bash
docker rm -f aipic
```

### Docker 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `AIPIC_PORT` | `8080` | Compose 暴露到宿主机的端口 |
| `DEFAULT_API_URL` | `https://sub2api.simplaj.top/` | 前端 API 设置里显示的默认地址 |
| `API_PROXY_URL` | `https://sub2api.simplaj.top/v1` | 容器内 Nginx 代理转发目标 |
| `ENABLE_API_PROXY` | `true` | 是否启用 `/api-proxy/` 同源代理 |
| `LOCK_API_PROXY` | `true` | 是否强制走代理，避免用户误关后触发 CORS |
| `PROMO_API_URL` | `https://sub2api.simplaj.top/` | 顶部中转站入口跳转地址 |
| `PROMO_API_LABEL` | `稳定API中转站，注册送5刀，可免费修10张图` | 顶部中转站入口显示文案 |

修改端口示例：

```bash
AIPIC_PORT=3000 docker compose up -d --build
```

切换到其他 OpenAI 兼容接口示例：

```bash
DEFAULT_API_URL=https://example.com/ \
API_PROXY_URL=https://example.com/v1 \
docker compose up -d --build
```

只替换顶部中转站入口，不改模型请求接口：

```bash
PROMO_API_URL=https://your-gateway.example.com/ \
PROMO_API_LABEL=我的中转站 \
docker compose up -d --build
```

### Docker 使用流程

1. 打开 `http://服务器IP:8080/`。
2. 点击右上角 `API 设置`。
3. 填入 API Key，模型 ID 默认可用 `gpt-image-2`。
4. 保持代理开启，提交文生图或图生图任务。

如果请求失败，优先检查：

- `API_PROXY_URL` 是否带 `/v1`。
- API Key 是否有效。
- 上游是否支持 `/v1/images/generations` 和 `/v1/images/edits`。
- 服务器是否能访问上游 API。

## Cloudflare Pages 部署

项目已配置 Cloudflare Pages：

```text
wrangler.jsonc
project name: aipic
build output: dist
```

登录 Cloudflare：

```bash
npx wrangler login
```

构建并部署：

```bash
npm run build
npx wrangler pages deploy dist --project-name aipic --branch main
```

部署后生产地址：

```text
https://image.simplaj.top/
```

如果需要确认账号权限：

```bash
npx wrangler whoami
```

## 本地代理开发

如果本地遇到 CORS，可复制代理配置：

```bash
cp dev-proxy.config.example.json dev-proxy.config.json
```

然后修改 `dev-proxy.config.json`：

```json
{
  "prefix": "/api-proxy",
  "target": "https://sub2api.simplaj.top/v1"
}
```

重启开发服务后，在页面 API 设置中开启代理即可。

## 常用命令

```bash
npm run dev          # 启动 Vite 开发服务
npm run build        # TypeScript 检查并构建 dist
npm test             # 运行 Vitest 测试
npm run mock:api     # 启动本地模拟图片 API
```

## 目录结构

```text
src/components/RetouchWorkspace.tsx   专业修图工作台主界面
src/store.ts                          任务提交、历史、IndexedDB 状态逻辑
src/lib/api.ts                        图片 API 请求入口
src/lib/apiProfiles.ts                API 配置和默认地址
functions/api-proxy/[[path]].ts       Cloudflare Pages API 代理
public/retouch-studio-sample.png      工作台示例图
wrangler.jsonc                        Cloudflare Pages 配置
```

## 使用建议

- 先用 1K、1 张、快速质量测试 prompt 是否正确。
- 参考图修图时优先使用图生图模式，文生图模式不会引用参考图。
- 局部修改时先涂抹 mask，再提交局部修图。
- 4K、精修、多图、带参考图任务更容易触发上游超时；失败时先降低尺寸、质量或数量。
- prompt 中明确写出需要保留的身份、结构、文字、边缘、光影和背景元素。

## 技术栈

- React 19
- TypeScript
- Vite
- Zustand
- Vitest
- Cloudflare Pages Functions
- OpenAI 兼容 Image API / Responses API
- fal.ai 和自定义 HTTP 服务商配置

## 致谢

本项目基于 [CookSleep/gpt_image_playground](https://github.com/CookSleep/gpt_image_playground) 开源项目改造，遵循原项目 MIT License。

感谢原项目作者和社区贡献者。
