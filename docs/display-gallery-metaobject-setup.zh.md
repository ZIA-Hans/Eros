# Display Gallery（人种 × 商品 → 图片组）配置手册

本功能在产品详情页的 **Product siblings** block（即 Combined listings / Product variations）标题行旁新增一个入口按钮，点击后弹出窗口，用户可在弹窗内选择「人种」和「商品」组合，查看对应的图片组（2×2 网格）。

数据完全由 **Metaobject** 配置驱动，无需写任何代码或 JSON。

---

## 在哪里启用

1. 主题编辑器（Online Store → Themes → Customize）
2. 打开产品详情页 → 左侧找到 **"Combined listings / Product variations"**（即 Product siblings）block
3. 勾选 **"Enable display gallery"**，填写 **"Button text"**

> ⚠️ 前置条件：该产品的 `custom.display_sets` metafield 必须挂了数据，否则按钮不渲染（代码有守卫 `{% if dg_sets != blank %}`）。

---

## 数据关系总览

```
① 人种 (display_race)      ─┐  全局字典，建一次到处复用
② 商品 (display_product)    ─┤
③ 图片 (display_photo)      ─┘

④ 图组 (display_set)        ──  组合记录：选 ① 一个 + ② 一个 + ③ 多张
        │
        │  挂到产品的 metafield
        ▼
   product.custom.display_sets  (list.metaobject_reference → display_set)
```

口诀：① ② ③ 是「字典」（配一次、全站复用）；④ 是「记录」（每个 人种×商品 组合建一条）；最后把记录挂到产品上。

---

## 第 0 步：进入入口

后台 → **Settings（设置）→ Custom data（自定义数据）→ Metaobjects（元对象）→ Add definition（添加定义）**

> ⚠️ 顺序铁律：必须先建 ①②③，再建 ④。因为 ④ 要「引用」前三个，被引用者必须先存在。

---

## ① 元对象：`display_race`（人种 · 全局可复用）

**Name：** Display Race　**Handle：** `display_race`

| 字段名 (Name) | Handle | 类型 (Type) | 必填 | 说明 |
|---|---|---|---|---|
| Name | `name` | Single-line text（单行文本） | ✅ | 黄种人 / 白种人 / 黑种人 / 棕种人 |
| Thumbnail | `thumbnail` | File（文件） | 否 | 肤色缩略图 |

> 建议把 `name` 字段勾选 **"Use as the entry name"（作为条目名称）**。

---

## ② 元对象：`display_product`（商品 · 全局可复用）

**Name：** Display Product　**Handle：** `display_product`

| 字段名 (Name) | Handle | 类型 (Type) | 必填 | 说明 |
|---|---|---|---|---|
| Title | `title` | Single-line text | ✅ | 商品标题（弹窗选择器里显示这个） |
| Product | `product_ref` | **Product（产品）** | ✅ | 产品选择器，指向它对应的产品 |

---

## ③ 元对象：`display_photo`（单张图片 · 全局可复用）

**Name：** Display Photo　**Handle：** `display_photo`

| 字段名 (Name) | Handle | 类型 (Type) | 必填 | 说明 |
|---|---|---|---|---|
| Title | `title` | Single-line text | 否 | 这张图的标题/说明 |
| Image | `image` | **File（文件）** | ✅ | 图片本身 |

---

## ④ 元对象：`display_set`（图组组合记录 · 按需建多条）

**Name：** Display Set　**Handle：** `display_set`

| 字段名 (Name) | Handle | 类型 (Type) | 必填 | 关键操作 |
|---|---|---|---|---|
| Race | `race` | **Metaobject（元对象）** | ✅ | Type 选 Metaobject → **Reference to** 下拉选 `display_race`。**保持单值（One value）。** |
| Product | `product_label` | **Metaobject** | ✅ | 同上，Reference to 选 `display_product`，单值 |
| Photos | `photos` | **Metaobject** | ✅ | Type 选 Metaobject → **Reference to 选 `display_photo`** → 开关切到 **List（列表）** |

---

## ⑤ 产品 Metafield（挂载钩子）

入口：**Settings → Custom data → Products（产品）→ Add definition**

| 项 | 值 |
|---|---|
| Name | Display Sets |
| Namespace and key | `custom.display_sets` |
| Type | 选 **"Metaobject"** → 然后选 **"List of values（列表）"** → Reference to 选 `display_set` |

---

## 日常录入流程（举例：产品「真丝裙」）

1. **一次性建字典**：Content → Metaobjects → 分别给 `display_race`、`display_product`、`display_photo` 建条目。
2. **建图组**：`display_set` → 为每个 (人种 × 商品) 组合建一条，挂 4 张图（2×2）。
3. **挂到产品**：打开产品 → 底部 Metafields → `display_sets` → 把刚才建的记录选上。
4. **开开关**：主题编辑器 → Product siblings block → 勾 "Enable display gallery"。

---

## 速查：每个产品大概要建多少条？

`人种数 × 商品数` 条 `display_set`，每条挂 4 张图（2×2）。
例如 4 人种 × 1 商品 = **4 条**；4 人种 × 3 商品 = **12 条**。

---

## 常见问题

**Q：图片必须正好 4 张吗？**
A：不必须。弹窗是 2×2 网格平铺，4 张最饱满；不足 4 张时左对齐自适应；超过 4 张会换行继续排。

**Q：改了人种名称，所有产品会自动同步吗？**
A：会。因为人种是全局 metaobject，所有引用它的图组都共享同一条记录，改一处全局生效。
