# indicators.yaml — schema 与导出时机

`indicators.yaml` 是 PRD 的**结构化配套产物**：把 §12 附录里的指标/规则/字段从散文表格提炼成机器可读的 yaml。下游消费它：
- `prd-to-ui-spec`：数据绑定的字段命名（UI 元素 ← 哪个指标/字段），让绑定具体而非靠猜。
- `spec-to-slice`：后端配置加载、schema 字段命名、领域纯模块的输入契约。

## 何时导出 / 何时跳过

- **导出**：领域含结构化评价/计分体系、配置项、字段清单、负面清单、阈值/上限/系数等（评价系统、风控、合规审查这类）。
- **跳过**：纯流程/CRUD 类需求，没有可枚举的指标体系。跳过时在 PRD 里说明「本期无结构化指标配置」即可。

## Schema

顶层是若干分组（group），每组下挂指标（indicator）；另设可选的 `rules`（规则/负面清单）与 `meta`。字段命名用 snake_case 英文，**与 §6 数据模型、后端 DTO 对齐**。

```yaml
meta:
  source_prd: PRD-talent-eval      # 回指来源 PRD
  version: v1.0                    # 与 PRD version 对齐
  domain: talent-eval

groups:
  - id: academic                   # 分组英文 id，唯一
    name: 学术水平                  # 中文名（UI 展示用）
    weight: 0.4                    # 组权重（若有），0~1
    indicators:
      - id: paper_count            # 指标英文 id，全局唯一 → 直接做字段名
        name: 论文数量              # 中文名
        type: number               # number | enum | bool | text | date
        unit: 篇                    # 可选
        cap: 20                    # 上限（若有）
        rank_coef: 1.2             # 排名系数（若有）
        source_fr: FR-5.1.3        # 回指实现该指标的功能需求
        rule: 每篇计 1 分，超过 cap 不再累加   # 计算/取值口径
        enum:                      # type=enum 时给取值域
          - { value: A, label: 一类, score: 5 }
          - { value: B, label: 二类, score: 3 }

rules:                             # 可选：负面清单 / 一票否决 / 互斥
  - id: blacklist_veto
    name: 负面清单一票否决
    type: veto                     # veto | exclusive | threshold
    source_fr: FR-5.1.8
    description: 命中负面清单任一项则总评否决，不计入排序
    items: [学术不端, 重大违纪]
```

## 约定

- 每个 indicator / rule 尽量带 `source_fr` 回指 PRD 的 `[FR-*]`——让配置也可追溯。
- `id` 一旦定下不改名（同 FR 的稳定性原则）；改名等于改字段，会震动前后端。
- 阈值/权重若 PRD 标为待定（`[OQ-*]`），yaml 里留空或给占位并注释 `# OQ-n 待定`，不要假填。
- 输出到 `/mnt/user-data/outputs/indicators.yaml`，与 PRD.md 同目录交付。
