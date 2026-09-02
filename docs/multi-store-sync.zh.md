# 多国家工作流（AU / US）

```
pull（首次）        线上完整代码 → dist/<国>/（提交 git，各国天然分开）
dev:<国>            dist/<国> → .dev/（不提交的预览区，同一时间只有一个国家）
                    → shopify theme dev（店铺的 Development 沙箱主题，不碰真实主题）
                    改根目录共享代码，保存即实时同步进 .dev/ 热刷新；
                    退出时自动把 .dev/ 里的配置改动回收进 dist/<国>
build               根目录共享代码正式同步进 dist/us、dist/au（不覆盖该国定制）
push:<国>           dist/<国> 推送线上
```

## 什么放在哪里

| 内容 | 位置 | 规则 |
|---|---|---|
| 共享代码（sections/snippets/assets/…） | 仓库根目录 | **只改这里**；`yarn build` 同步进两国 dist |
| 各国配置 `settings_data.json` | `dist/<国>/config/` | 属于该国，build 只在缺失时种入，之后由 pull / 编辑器回收更新 |
| 页面模板 `templates/*.json` | `dist/<国>/templates/` | 默认跟随根目录基准；某国改过的（编辑器/pull）自动受保护不被 build 覆盖 |
| `.base-manifest.json` | `dist/<国>/` 内 | 打包工具自动维护的"原版指纹"（**语义级**：CLI 重排 JSON 格式不算改动），随 git 提交 |
| `.dev/` | 唯一预览区 | 纯一次性：可随时整体删除，dev 启动时从 dist/<国> 重建；整体 gitignored |

## 命令

```bash
yarn pull:us / pull:au    # 线上完整代码拉进 dist/<国>（首次必做）；--config-only 只拉配置
yarn dev:us / dev:au      # 开发预览（一次只能跑一个国家，切换前先退出）
yarn build                # 共享代码 → 两国 dist（提交前执行）
yarn push / push:us       # build 后推送；--code-only 不动线上设置；--prune 允许删除多余文件
yarn capture:us           # 手动回收 .dev/ 的配置改动（dev 异常退出后补救）
yarn store:list           # 各国状态（定制模板数等）
```

## 日常开发

1. `yarn dev:us` → 预览地址 http://127.0.0.1:9292（首次弹浏览器授权）。
   - `.dev/` 被整体重建为 US 内容；若另一国家的 dev 会话在运行会被拒绝（单会话约束）。
   - dev 使用店铺的 **Development 沙箱主题**（不指定 `--theme`），线上真实主题绝不会被 dev 会话修改。
2. 改根目录的 section/snippet 等共享代码 → 保存 → 自动同步进 `.dev/` → 预览热刷新（无需手动 build）。
3. 改页面配置：在预览的主题编辑器里改（预览地址栏按 `e` 进入），`--theme-editor-sync` 自动写回 `.dev/`。
4. `Ctrl+C` 退出：`.dev/` 里改过的 `settings_data.json` / 模板自动回收进 `dist/us/`（按**语义**比较，格式差异不算）。
   - Windows 下若出现 `Terminate batch job (Y/N)?` 提示，按 `Y` 继续退出即可。
   - 异常强退后可用 `yarn capture:us` 补救回收。
5. 提交前 `yarn build`（共享代码正式进两国 dist），连同 dist 一起 git 提交。

## 发布

```bash
yarn push            # 两国：build + shopify theme push --nodelete
yarn push:us         # 只推 US
```

- 默认 `--nodelete` 不删线上多出的文件；确认要清理加 `--prune`。
- ⚠️ push 会用 `dist/<国>` 的 settings_data 覆盖该国线上设置。规范：**先 pull 或先 dev 回收，再 push**；临时只发代码用 `yarn push:us --code-only`。

## 各国配置分开的保证

- pull 写入 `dist/<国>/`；dev 回收写入 `dist/<国>/`；两国目录互不可见。
- 共享代码永远是根目录单一来源；某国定制被语义指纹识别并保护，`store:list` 可查看各国定制数量（当前 US 定制 4 个模板）。

## 认证

- 默认浏览器登录（每店首次）。
- 免交互：复制 `tokens.local.json.example（仓库根目录）` → `tokens.local.json`（仓库根目录），按国家码填 Theme Access token（gitignored，自动注入 `SHOPIFY_CLI_THEME_TOKEN`）。

## 常见问题

- **dev 报 "Reconciliation Strategy" 交互失败（CI/后台）**：脚本已内置 `--reconciliation-strategy keep-local`（预览区即事实来源）。
- **为什么 dev 不指定 --theme**：指定真实主题 ID 时 CLI 会与该主题双向同步，存在把本地内容覆盖到线上的风险（开发预览应使用 CLI 自动创建的 Development 沙箱主题）。push 才是唯一向真实主题写代码的通道。
- **为什么不用 rollup/webpack**：这里的"打包"只是文件同步与合并（.liquid/.json 原样进出，无编译变换），零依赖 Node 脚本即打包工具本身；将来若需压缩 assets 里的 JS/CSS 再引入 esbuild 类流水线即可。
- **误删了 dist/<国>/ 怎么办**：`yarn pull:<国>` 重新拉取该国线上内容；`yarn build:<国>` 只能恢复共享代码（配置需 pull）。
