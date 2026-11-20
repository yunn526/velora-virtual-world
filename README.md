# VELORA — Virtual Exhibition World

> **暫定專案名稱：VELORA**  
> *A World Beyond Walls.*

VELORA 是一個以 3D 虛擬展覽空間為核心的 PWA 概念平台。使用者可以在虛擬展館中自由探索不同樓層，未來可建立個人展覽、邀請朋友共同策展，並透過展覽排程與社群探索，讓作品被更多人看見。

目前專案名稱 **VELORA 尚未完成商標、網域或 App 名稱查核**，正式名稱可能調整。

---

## Project Vision

打造一個不只是圖片分享網站的虛擬世界：

- 使用者可以自由走動、探索展館。
- 展覽以 3D 空間呈現，而非單純圖片列表。
- 每個樓層都有不同用途與展覽內容。
- 未來使用者可以打造自己的展覽空間。
- 支援多人共同策展與官方展覽排程。

## Phase 1 — World & Authentication

第一階段先建立世界、基本登入與探索體驗，不加入寶石、PRO、商店或金流。

### Phase 1 Scope

- [ ] PWA 基本架構
- [ ] Google 登入（Firebase Authentication）
- [ ] 登入後進入 3D 展館
- [ ] 五層展館的基本空間結構
- [ ] 一樓大廳與服務中心
- [ ] 二至四樓使用者自由展覽區
- [ ] 五樓特別展覽區
- [ ] 樓層切換
- [ ] 電腦端自由移動（WASD）
- [ ] 滑鼠視角控制
- [ ] 移動加速
- [ ] 手機端操作規劃／觸控控制
- [ ] 響應式介面
- [ ] 基本載入與效能最佳化

### Floor Plan

| Floor | Area | Description |
|---|---|---|
| 5F | Featured Exhibition | 官方安排的特別展覽、精選作品與主題活動 |
| 4F | Community Gallery III | 使用者自由展覽區 |
| 3F | Community Gallery II | 使用者自由展覽區 |
| 2F | Community Gallery I | 使用者自由展覽區 |
| 1F | Main Lobby | 入口大廳、服務台、樓層導覽與公告 |

二至四樓未來預計每日或每週輪替不同使用者作品與展覽。展覽輪替、使用者上傳及管理員排程將於後續階段開發。

## Controls

### Desktop

- **W / A / S / D** — 移動
- **Mouse** — 控制視角
- **Shift** — 加速移動
- **ESC** — 退出視角控制

### Mobile

後續規劃虛擬搖桿、觸控視角控制及適合手機的互動介面。

## Planned Features

以下功能不屬於 Phase 1，將依開發階段逐步加入：

### Phase 2 — Exhibitions

- 建立個人展覽
- 上傳展覽圖片／作品
- 展覽標題、介紹與封面
- 作品說明及排列
- 展覽公開與下架
- 使用者展覽保存期限
- 管理員展覽審核與排程
- 二至四樓展覽輪替

### Phase 3 — Gems & Check-in

- 每日簽到與寶石獎勵
- 新使用者七日獎勵
- 寶石錢包及紀錄
- 寶石排行榜
- 展覽門票與延長展期等用途

### Phase 4 — Customization

- 家具與裝飾商店
- 椅子、盆栽、展示台、服務台
- 牆面、地板、燈光與展場配置
- 使用者自訂展覽空間

### Phase 5 — Collaboration & Official Exhibitions

- 邀請共同策展人
- FREE／PRO 協作人數限制
- 共同編輯權限
- 官方展覽建立與排程
- 展覽門票及活動管理

### Phase 6 — PRO Membership

- 管理員核發 PRO
- 月費與年費方案設定
- 首月試用規則
- PRO 展覽期限與功能
- 未來再評估金流整合

## Proposed Technology Stack

| Area | Technology |
|---|---|
| Frontend | React + TypeScript |
| 3D | Three.js / React Three Fiber |
| PWA | Web App Manifest + Service Worker |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| Image Storage | Firebase Storage |
| Backend / Permissions | Firebase Security Rules + Cloud Functions |
| Hosting | Cloudflare Pages or Firebase Hosting |

技術選擇可能依實作與效能測試調整。

## Project Structure

```text
velora-virtual-world/
├── public/
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── worlds/
│   ├── floors/
│   ├── auth/
│   ├── firebase/
│   └── styles/
├── index.html
├── package.json
└── README.md
```

## Development Principles

1. **先完成可探索的世界，再增加功能。**
2. 3D 空間應優先考慮手機與一般電腦的效能。
3. 展覽圖片與 3D 場景分開載入，避免初次載入過重。
4. 使用者資料、作品與權限必須由後端規則保護。
5. 管理員權限不可只靠前端隱藏按鈕。
6. 任何展覽到期或下架機制，都應保留使用者作品資料，避免不必要的資料遺失。
7. Phase 1 不實作金流、寶石、PRO 或完整使用者展覽系統。

## Getting Started

此 README 對應 Phase 1 開發規劃。實際啟動指令、Firebase 設定及部署流程，會依目前專案檔案更新。

---

**VELORA**  
*A World Beyond Walls.*
