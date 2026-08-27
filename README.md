# lieshou-cloud-admin-web · 猎手云 B 端管理后台(开源)

> 猎手云(开源)的 B 端管理后台:登录 / RBAC / 租户 / 审批流 / 客户 CRM / 财务 / 进销存等通用业务工作台。
> 行业版页面与客户定制通过 **Edition 配置 + 客户仓注入**(`extraRoutes`)装配,不在本仓内。

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-6-646cff" alt="Vite 6"/>
  <img src="https://img.shields.io/badge/Antd-5.22-1677ff" alt="Antd 5.22"/>
  <img src="https://img.shields.io/badge/License-Apache--2.0-brightgreen" alt="Apache-2.0"/>
</p>

## 技术栈

- Vite 6 + React 19 + TypeScript(strict)+ antd 5.22 + ProComponents 2.8
- 共享层 `@lieshoucloud/{api-client,config,types,ui}` 经 `open/` submodule 挂载 [lieshou-cloud-web](https://github.com/HUNTERCAT-DIGITAL/lieshou-cloud-web)

## 功能

- 登录 / 租户自助开通 / 版别识别(`VITE_EDITION` → 域名推断 → generic)
- 用户 / 角色 / 租户 / 审计 / 审批流 / 菜单权限(RBAC)
- 客户 CRM / 线索 / 联系人 / 合同 / 会员 / 进销存 / 财务 / 质检等通用业务模块
- 数据看板(BI 雏形)+ 通用工作台门户(`GenericPortal`)
- 客户 Edition 注入槽位(`getExtraEdition().extraRoutes` + `import.meta.glob('./*.extra.ts')`)

## 快速开始

```bash
git clone git@github.com:HUNTERCAT-DIGITAL/lieshou-cloud-admin-web.git
git submodule update --init --recursive   # 拉 open/(lieshou-cloud-web 共享包)
pnpm install
pnpm dev                                  # Vite,默认 5173
```

配套后端:[lieshou-cloud](https://github.com/HUNTERCAT-DIGITAL/lieshou-cloud)(开源底座,gateway/auth/user/admin/approval)。

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发服务器 |
| `pnpm typecheck` | tsc -b |
| `pnpm lint` | ESLint(flat config) |
| `pnpm test` | Vitest(注:`test` 为 watch 模式,CI 用 `npx vitest run`) |
| `pnpm build` | tsc -b && vite build |

## 客户/行业装配(2026-09 客户聚合仓模式)

本仓只含**通用部分**;行业能力(legal/iot/edu 页面)与客户定制(品牌/裁剪/专属路由)由**客户仓**注入:

- 客户 Edition 配置在客户仓 `config/editions/<client>.ts`(本仓仅 `generic` + `layer` 预设)
- 客户仓经 `deploy/prepare.mjs` 生成 `editions/<client>.extra.ts`(extraRoutes)→ 本仓 `import.meta.glob` 装配
- 渲染层 `EditionGuard` / `filterRoutes` 按 `edition.hiddenMenus` 裁剪

## 关联仓库

- 共享层(开源):`HUNTERCAT-DIGITAL/lieshou-cloud-web`
- 后端底座(开源):`HUNTERCAT-DIGITAL/lieshou-cloud`
- 其他端(开源):`lieshou-cloud-desktop` · `lieshou-cloud-mobile` · `lieshou-cloud-mini-program`
- 商业主仓:`HUNTERCAT-DIGITAL/lieshou-cloud-pro`

## License

Apache-2.0,见 [LICENSE](LICENSE)。
