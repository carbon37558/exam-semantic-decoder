# Exam Semantic Decoder

Exam Semantic Decoder（考题语义认知减负器）是一个由教师语义数据库驱动的考试语言标注工具。它帮助 IGCSE、A-Level、IB、AP 等国际课程学生识别题目中的关键考试语言，并快速激活这些表达背后的正确概念。

## 核心理念

它不是：

- 翻译工具
- AI 解题工具
- AI 解释器

它只使用教师人工整理的数据，实现：

```text
exam language → decoded meaning
```

程序不会生成、修改、扩展或补充 `official` 与 `decoded` 内容。

## 数据库

唯一需要人工维护的数据源是：

```text
data/exam_semantic_decoder_terms.xlsx
```

Excel 第一张工作表需要包含以下字段：

- `term`：核心考试概念
- `aliases`：使用英文逗号分隔的匹配别名
- `subject`：学科标识
- `official`：教材或考试中的正式译法
- `decoded`：教师整理的认知解释

`pnpm dev` 和 `pnpm build` 会在运行前自动读取 Excel，并生成网页使用的 `src/generated/terms.json`。这个 JSON 是构建产物，不需要人工编辑；Excel 始终是唯一数据源。

### 上下标书写

`official` 和 `decoded` 中已有的 Unicode 上下标会原样保留。也可以在 Excel 中使用以下纯文本写法，构建时会自动转换：

- `H_2O` → `H₂O`
- `SO4^2-` → `SO₄²⁻`
- `Mg^2+` → `Mg²⁺`
- `x^2` → `x²`
- `x_1` → `x₁`

没有 `_` 或 `^` 标记的普通数字不会被转换。请不要依赖 Excel 单元格的字体上标或下标样式；需要保留的格式应使用 Unicode 字符或上述纯文本标记。

## 技术栈

- React 19
- TypeScript
- Vite
- SheetJS（构建时读取 Excel）
- Fontsource 自托管 Noto Sans SC / Noto Serif SC 字体

网站构建后是纯静态文件，不需要后端、数据库服务器、API、登录或 AI 服务。

## 本地运行

需要 Node.js 22.13 或更高版本，以及 pnpm。

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

终端会显示本地访问地址，通常为 `http://localhost:5173`。

## 生产构建

```bash
pnpm build
```

静态部署文件会生成在：

```text
dist/
```

本地预览生产构建：

```bash
pnpm preview
```

运行完整构建与匹配规则测试：

```bash
pnpm test
```

## Cloudflare Pages 部署

将 GitHub 仓库连接到 Cloudflare Pages，并使用以下配置：

- Framework preset：`React (Vite)`
- Build command：`pnpm build`
- Build output directory：`dist`
- Root directory：仓库根目录
- Production branch：`main`
- Environment variable：`PNPM_VERSION=11.19.0`

项目通过 `.node-version` 固定 Cloudflare 构建环境使用 Node.js 22.16.0。Cloudflare Pages v3 不会根据锁文件自动识别 pnpm 版本，因此建议通过上面的环境变量固定 pnpm。

每次向 GitHub 的 `main` 分支推送后，Cloudflare Pages 会自动重新读取 Excel、构建并部署网站。

## GitHub 提交注意事项

应该提交：

- `data/exam_semantic_decoder_terms.xlsx`
- `src/`（自动生成的 `src/generated/terms.json` 除外）
- `public/`
- `scripts/`
- `package.json`
- `pnpm-lock.yaml`
- 其他项目配置文件

不要提交：

- `node_modules/`
- `dist/`
- `src/generated/terms.json`
- 本地缓存或环境变量文件

教师未来只需要维护 `data/exam_semantic_decoder_terms.xlsx`。
