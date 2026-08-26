# LieShouCloud-web · 猎手云前端共享包(开源)

> **所有前端终端(admin-web / desktop / mobile / mini-program)的共享层**,独立于后端底座 `LieShouCloud` 发布。
> 消费端通过 submodule 挂载本仓(路径约定 `open/`),`pnpm-workspace.yaml` 指向 `open/packages/*` 经 `workspace:*` 引用。

## 包清单

| 包                         | 定位      | 内容                                                                                                               |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `@lieshoucloud/api-client` | L0 传输层 | 统一 HTTP/JWT/401 单飞 refresh/错误体解析 + blob/devlog;`gen:api` 从后端 OpenAPI 生成契约                          |
| `@lieshoucloud/config`     | L0 配置层 | 运行时常量统一出口:readEnv(跨构建工具前缀探测)/ resolveApiBase / 租户常量                                          |
| `@lieshoucloud/types`      | L0 契约层 | 共享 DTO/枚举:`business/*` 22 模块业务契约 + user-service OpenAPI `generated.ts`                                   |
| `@lieshoucloud/ui`         | L1 组件层 | datav 大屏组件 + web 通用组件(AuthGuard / ErrorBoundary / PageLoading…)+ hooks(useApiError / usePaged / useClock…) |

依赖方向:`ui → api-client / types`,`types → config` 之外无反向依赖;底层能力只经 import 复用,消费端禁止复制。

## 开发

```bash
pnpm install
pnpm typecheck   # turbo run typecheck
pnpm test        # vitest(ui / config)
pnpm lint        # eslint
```

### 重新生成 OpenAPI 契约(仅改后端接口时)

```bash
# 需本地起后端(user-service 提供 OpenAPI)
cd api-client && pnpm gen:api
cd types && pnpm gen:api
```

`generated.ts` 已入库,运行时无后端依赖——只有契约变更时才需要重新生成。

## 消费方式

消费仓(如 admin-web)内:

```bash
git submodule add git@github.com:HUNTERCAT-DIGITAL/LieShouCloud-web.git open
# pnpm-workspace.yaml:
#   packages:
#     - "open/packages/*"
pnpm install
```

共享包改动 → 消费端 bump `open/` pin(submodule 指针),包名与引用零改动。

## 关联仓库

- 后端底座(开源):`HUNTERCAT-DIGITAL/LieShouCloud` — gateway / auth / user / admin / approval
- 行业逻辑层:`HUNTERCAT-DIGITAL/LieShouCloudPro-industry`
- 商业主仓:`HUNTERCAT-DIGITAL/LieShouCloudPro`

## License

Apache-2.0,见 [LICENSE](./LICENSE)。
