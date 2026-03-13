# Goodhello — UX Documentation

> *"a great goodbye but also a promise hello to future"*

---

## Overview

**Goodhello** là một web experience cá nhân hóa, được xây dựng để gửi lời mời tốt nghiệp đến từng người khách theo một cách đáng nhớ và cảm xúc hơn so với thiệp mời truyền thống.

Thay vì một tấm card tĩnh, Goodhello là một single-page web app deploy trên Vercel, trong đó mỗi sinh viên tốt nghiệp sở hữu một **subdomain riêng** (ví dụ: `phatla.goodhello.space`, `quocbao.goodhello.space`). Khách truy cập sẽ trải qua một hành trình tương tác gồm: khai báo tên, mở phong bì thư mời, duyệt qua 6 "con tem" đại diện cho những ký ức đại học của chủ nhân, chọn một con tem yêu thích — sau đó mới được mở thiệp mời chính thức kèm các action thực tế như thêm lịch, xem địa điểm, để lại lời chúc, và tải về PDF.

**Ngữ cảnh:** Nhóm sinh viên UEH/BIT khóa 2023–2026. Sự kiện tốt nghiệp diễn ra ngày 4/4/2026 tại 59c Nguyễn Đình Chiểu, Q.3, TP.HCM.

**Mục tiêu cốt lõi:**
- Tạo ra một trải nghiệm thiệp mời đủ ý nghĩa để người nhận nhớ đến sau khi rời trang.
- Gắn kết người khách với câu chuyện cá nhân của chủ nhân qua hệ thống stamp/memory.
- Tích hợp đủ utility (calendar, map, PDF, wish board) để thiệp mời này *thực sự dùng được*, không chỉ để xem.
- Xây dựng một format có thể replicate cho nhiều sinh viên chỉ bằng cách thêm data — không cần code lại.

---

## Role & Responsibility

| Role | Trách nhiệm |
|---|---|
| **Product Designer / UX Designer** | Xác định user flow, thiết kế interaction model (stamp gate, envelope animation, wish drag-drop), wireframe và visual direction |
| **UI Designer** | Xây dựng design system (typography stack, color tokens), thiết kế từng section và responsive behavior |
| **Frontend Developer** | Implement bằng Vanilla JS + GSAP + Lenis; audio system, subdomain routing, PDF export |
| **Content Creator** | Viết stamp descriptions (personal stories) cho từng user, curation 9 background music tracks |
| **Data / Backend** | Cấu hình Google Apps Script làm API layer (wish board, visit tracking); Vercel deploy config |

> Dự án này được thực hiện bởi **lefacteur** (`@postoffice indacorner`) với vai trò solo.

---

## Strategy Stage

### Vấn đề cần giải quyết

Thiệp mời tốt nghiệp thông thường (giấy, hoặc ảnh tĩnh trên mạng xã hội) thiếu tính cá nhân hóa và không tạo được emotional connection giữa người mời và người được mời. Người nhận đọc xong thường không nhớ, không tương tác thêm.

### Target Users

- **Primary:** Bạn bè thân thiết, người thân, đồng nghiệp/mentor của từng sinh viên — những người có mối quan hệ cá nhân đủ sâu để appreciate một experience như thế này.
- **Secondary:** Các sinh viên tốt nghiệp trong nhóm — được trao quyền dùng platform để mời riêng khách của mình.

### User Goals

- Biết thông tin sự kiện (ngày, giờ, địa điểm).
- Cảm nhận được sự trân trọng và tình cảm từ lời mời.
- Có thể để lại lời chúc một cách dễ dàng.

### Design Principles

1. **Emotion trước Utility** — Người dùng phải *cảm nhận* trước khi được *dùng*. Stamp Gate mechanic enforce điều này.
2. **Progressive Disclosure** — Invitation card bị ẩn (blur + lock) cho đến khi hoàn thành hành trình stamps.
3. **Delight through Interaction** — Mỗi micro-interaction (envelope mở, stamp chọn, confetti, card bounce, wish drag) đều có animation riêng.
4. **Zero-friction Utility** — Calendar, map, PDF là các action một chạm, không cần login hay thêm bước.

---

## Scope Stage

### Functional Requirements

Các chức năng chính của hệ thống theo thứ tự user flow:

| # | Chức năng | Mô tả |
|---|---|---|
| F1 | **Multi-user routing** | Phát hiện subdomain để load đúng data của từng sinh viên. Fallback về `phatla`. Hỗ trợ `?user=xxx` để test. |
| F2 | **Guest name input** | Modal yêu cầu tên khách khi lần đầu truy cập. Lưu vào `localStorage` (namespaced theo user). Bỏ qua ở lần sau. |
| F3 | **Visit recording** | Ghi lượt truy cập (tên khách, timestamp, host) vào Google Sheets — fire and forget. |
| F4 | **Envelope animation** | Phong bì SVG đa lớp mở ra bằng GSAP timeline sau khi modal đóng. |
| F5 | **Stamps browser** | 6 stamps theo layout tròn (desktop) hoặc horizontal snap carousel (mobile). Hover hiện tên stamp. |
| F6 | **Stamp detail overlay** | Click stamp → full-screen overlay với ảnh, tiêu đề, mô tả, nút "Choose as Favorite". ESC để đóng. |
| F7 | **Stamp Gate** | Sections phía dưới bị blur + scroll lock cho đến khi user chọn stamp yêu thích. Desktop only. |
| F8 | **Favorite stamp → Invitation** | Khi chọn stamp: confetti + flying animation → auto-scroll → stamp bounce vào invitation card. |
| F9 | **Personalized invitation card** | Hiện tên khách, stamp đã chọn, và thông tin sự kiện đúng với user đang xem. |
| F10 | **Add to Calendar** | Tạo Google Calendar deep link với đầy đủ metadata — mở tab mới. |
| F11 | **View on Map** | Mở Google Maps với địa chỉ sự kiện — mở tab mới. |
| F12 | **Leave a wish** | Modal textarea → submit gọi `addWish` API → optimistic close → toast feedback. |
| F13 | **Wish board** | Fetch wishes từ Google Sheets (filter theo user), render thành sticky-note cards có drag & drop. |
| F14 | **PDF download** | `html2canvas` capture invitation card → `jsPDF` render → save file. |
| F15 | **Audio system** | 9 background tracks, mute/unmute, volume slider, track selector. Autoplay workaround (delay 5s + toast). Disabled trên mobile. |

---

### Content Requirements

Nội dung và tính năng bổ trợ cần có để các chức năng chính hoạt động đúng và đủ cảm xúc:

| # | Content / Supporting Feature | Phục vụ cho |
|---|---|---|
| C1 | **`users-data.json`** — mỗi user có: `mainTitle`, `event` (title, location, start, end), 6 `stamps` (src, alt, title, description) | F1, F5, F6, F9, F10, F11 |
| C2 | **Stamp images** (PNG) — 6 ảnh cá nhân per user tại `asset/stamp/{username}/` | F5, F6, F8, F9 |
| C3 | **Stamp descriptions** — personal stories bằng tiếng Anh, mỗi câu chuyện gắn với 1 kỷ niệm cụ thể trong 3 năm đại học | F6 |
| C4 | **Envelope SVG + textures** (webp) — visual asset tạo cảm giác "thư thật" | F4 |
| C5 | **Background music** — 9 tracks nhạc Việt/indie tại `asset/audio/bg/`, được curation thủ công theo mood | F15 |
| C6 | **SFX** — `stampsound.wav`, `getstamp.wav` cho interaction với stamp | F5, F6, F8 |
| C7 | **Google Apps Script Web App** — API endpoints: `recordVisit`, `getWishes`, `addWish` | F3, F12, F13 |
| C8 | **Vietnamese diacritic stripping** — utility bỏ dấu tiếng Việt từ user input trước khi render (font Mythshire không hỗ trợ glyph tiếng Việt) | F2, F12 |
| C9 | **Placeholder stamp** — `placeholderstamp.png` hiện trên card khi chưa chọn stamp, kèm link quay lại stamps section | F9 |
| C10 | **Footer calendar layout** — tháng 4/2026 visual, highlight ngày 4 (Graduation Day), credit @lefacteur | — |
| C11 | **GA4 + Microsoft Clarity** — analytics tracking hành vi người dùng | Monitoring |

---

## Structure Stage

### Information Architecture

Sản phẩm là một **linear narrative experience** — toàn bộ nội dung nằm trên một trang cuộn dọc theo thứ tự:
