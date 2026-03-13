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

Thiệp mời tốt nghiệp thông thường (giấy, hoặc ảnh tĩnh trên mạng xã hội) thiếu tính cá nhân hóa (nếu sử dụng template sẵn) và không tạo được emotional connection giữa người mời và người được mời. Người nhận đọc xong thường không nhớ nếu không có remind, không tương tác thêm.

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
[Modal] → [Hero: Envelope] → [Stamps Section] → [Invitation Card] → [Wishes Board] → [Footer]

### User Flow — First-time visitor
Truy cập URL (subdomain detection) ↓ Modal: Nhập tên → Submit ↓ (background: ghi visit vào Google Sheets) Envelope animation tự động chạy ↓ Scroll xuống → Stamps Section ↓ Click vào từng stamp → Xem detail overlay ↓ Chọn "Favorite" stamp ↓ (confetti + stamp fly animation) Auto-scroll → Invitation Card (stamp bounce vào card) ↓ Từ card, user có thể: ├── Add to Calendar ├── View on Map ├── Leave a wish → Modal → Submit └── Download PDF ↓ Scroll xuống → Wish Board (drag cards) ↓ Footer (April calendar / credits)

### User Flow — Returning visitor
Truy cập URL → Modal bị skip (name từ localStorage) ↓ Envelope animation → Scroll tự do (Stamp Gate không kích hoạt nếu đã chọn stamp)


### State Management

| State | Lưu ở | Ảnh hưởng |
|---|---|---|
| `guest_name_{user}` | localStorage | Hiển thị tên trên card, skip modal |
| `chosen_stamp_{user}` | localStorage | Unlock stamp gate, hiện stamp trên card |
| `audioEnabled`, `currentTrack`, `audioVolume` | localStorage | Nhớ audio preference |
| Wishes data | Google Sheets (remote, 5-min cache) | Nội dung wish board |
---

## Skeleton
Mô tả wireframe layout cho từng section (desktop):

1. **Guest Name Modal**
   - Full-screen overlay (backdrop blur).
   - Center: label → input field (single line) → submit button.
   - Validation inline (2–50 ký tự).

2. **Hero — Envelope**
   - 100vh section.
   - Center: envelope wrapper với fixed aspect ratio, các lớp SVG stack theo thứ tự back → flap → letter → front.
   - Dưới envelope: dashed "Place stamp here" placeholder (marching-ants animation, click để scroll xuống stamps).

3. **Stamps Section**
   - Desktop: large title text bên trái (thay đổi theo stamp đang hover), 6 stamps sắp xếp vòng tròn bán kính 450px bên phải — mỗi stamp có rotation riêng và float animation riêng.
   - Mobile: horizontal snap carousel (~70vw per item).
   - Stamp Detail Overlay: full-screen takeover, stamp image to (center), title + description, nút Favorite (bottom).

4. **Invitation Card**
   - Background gradient.
   - Card nằm giữa, rotate -4°, có shadow và texture.
   - Trên card: greeting (tên khách + tên chủ nhân), stamp (top-right), event info, 4 action buttons (Calendar / Map / Wish / PDF).

5. **Wishes Board**
   - Background shift màu ấm (#FFCD88).
   - Title font cursive phía trên.
   - Wish cards: absolute positioned, overlap, random rotation, drag-and-drop.
   - Drag hint text bottom-left.

6. **Footer**
   - Calendar grid tháng 4/2026 (3 cột cho ngày 3–4–5).
   - Ngày 4: highlighted blue + rotated note "Graduation Day".
   - Ngày 5: credits.
---

## Survey

Dự án này là một personal project với scope nhỏ, nên không có formal research phase. Tuy nhiên các design decisions phản ánh một số **implicit assumptions** đã được kiểm chứng qua observation:
| Assumption | Design Response |
|---|---|
| User lần đầu sẽ không biết phải làm gì | Modal tên như step 1 rõ ràng; envelope animation như intro trước khi vào nội dung |
| User có thể skip stamps và đi thẳng xuống invitation | Stamp Gate — blur + scroll lock enforcement |
| Font tiếng Việt không render đúng với Mythshire | Strip diacritics utility cho tất cả user-generated text |
| Autoplay audio bị browser block | Delay 5s + toast warning + volume fade-in |
| Mobile chiếm tỉ lệ đáng kể | Responsive breakpoints toàn bộ, carousel thay circular layout, audio disabled |
| Khách muốn lưu lại lời mời | PDF export với html2canvas + jsPDF |
| Không muốn setup backend phức tạp | Google Sheets + Apps Script làm database |
**Câu hỏi cần trả lời trong lần research tiếp theo:**
1. Người dùng có hiểu mục đích của Stamp Gate không, hay cảm thấy bị "blocked" frustrating?
2. Thời gian hoàn thành toàn bộ flow (modal → wish submit) là bao nhiêu? Có quá dài?
3. Tỉ lệ người thực sự để lại wish là bao nhiêu so với tổng visit?
4. Trên mobile, stamp carousel có đủ discoverable không?
---

## Result

### Output
- Web experience hoàn chỉnh, deploy trên Vercel tại `goodhello.space`.
- Multi-user architecture phục vụ 6+ sinh viên, mỗi người 1 subdomain riêng.
- 6 sections với đầy đủ animation, interaction, và utility features.
- Backend-less data layer (Google Sheets) với 3 endpoints: visit recording, wish submission, wish fetching.
- Hệ thống audio với 9 tracks, có selector + volume control.
- Mobile-responsive với behavior riêng biệt (không chỉ scale down).

### Outcome
- Tạo ra một digital artifact mang giá trị kỷ niệm — khách có thể relive lại 3 năm đại học của chủ nhân qua 6 stamps.
- Invite flow được gamify nhẹ (stamp selection mechanic) khiến người dùng tương tác chủ động thay vì đọc thụ động.
- Personalization thực sự: tên khách trên card, stamp họ chọn phản ánh gu riêng.
- Wish board tạo không gian cộng đồng — khách thấy lời chúc từ người khác, cảm giác cùng tham dự một sự kiện.
### Metrics

| Metric | Cách đo | Mục tiêu |
|---|---|---|
| Visit count per user | Google Sheets `recordVisit` logs | Biết mỗi sinh viên có bao nhiêu khách mở link |
| Wish submission rate | Số rows Sheets / số lượt visit | Tỉ lệ engagement của wish feature |
| Stamp selection rate | Thêm vào `recordVisit` payload | Xem Stamp Gate có bị bỏ qua không |
| Time on page | Microsoft Clarity session recordings | Đánh giá depth of engagement |
| Device split | GA4 device category | Validate responsive priority |
| Track preference | Log khi user chọn track | Biết track nào được nghe nhiều nhất |
---

## Takeaways for Future Iterations
1. **Stamp Gate trên mobile cần re-evaluate**
   - Scroll lock hiện chỉ áp dụng trên desktop.
   - Trên mobile, user có thể scroll thẳng xuống invitation mà không cần chọn stamp.
   - Cần quyết định: có muốn enforce narrative trên mobile không, và mechanism phù hợp là gì.

2. **Thêm social sharing**
   - Web Share API (`navigator.share`) có thể cho phép user chia sẻ link invitation của mình.
   - Đây là một viral loop tiềm năng đang bỏ trống.

3. **Tách stamp content ra khỏi JSON trong repo**
   - Hiện tại mỗi khi thêm user hoặc update nội dung cần commit lại code.
   - Nên tách ra một Google Sheet hoặc headless CMS để non-technical users tự update stamp descriptions.

4. **Xử lý missing stamp images gracefully**
   - Một số user chỉ có một vài stamp images thực tế.
   - Cần fallback UI rõ ràng phân biệt “chưa có ảnh” vs “placeholder intentional”.

5. **Loading state cho Wish Board**
   - Google Apps Script cold start có thể chậm.
   - Nên có skeleton/spinner rõ ràng để tránh cảm giác section bị trống.

6. **PDF export quality**
   - `html2canvas` bị giới hạn bởi CSS transforms và cross-origin images.
   - Cần test kỹ trên mobile và thêm error handling rõ ràng khi capture thất bại.

7. **Audio autoplay strategy**
   - Delay 5 giây là workaround chưa tối ưu.
   - Music nên bắt đầu ngay tại thời điểm user submit tên (đã có user gesture) thay vì dùng `setTimeout`.

8. **Scale architecture cho cohorts lớn hơn**
   - Nếu muốn scale lên 20–30 người/cohort, cần pipeline tự động, ví dụ:
     - Form intake (thu thập user slug + event details + stamp content)
     - Upload & validate stamp images
     - Generate data entry (thay vì sửa tay `users-data.json`)
     - Provision subdomain / routing
     - Deploy