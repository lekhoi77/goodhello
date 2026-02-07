# 📬 Interactive Layered Envelope Animation - Technical Documentation

## Mục lục
1. [Tổng quan](#1-tổng-quan)
2. [Dependencies](#2-dependencies)
3. [Cấu trúc SVG](#3-cấu-trúc-svg)
4. [Cấu trúc HTML](#4-cấu-trúc-html)
5. [CSS Styling](#5-css-styling)
6. [GSAP Animation](#6-gsap-animation)
7. [SVG Image Patterns](#7-svg-image-patterns)
8. [Responsive Breakpoints](#8-responsive-breakpoints)
9. [Customization Guide](#9-customization-guide)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Tổng quan

### Mô tả hiệu ứng
Đây là hiệu ứng Hero section với phong bì (envelope) có animation trồi lên từ dưới màn hình, nắp phong bì mở ra, và lá thư bên trong trồi lên để hiển thị nội dung.

### Animation Flow
```
[Trạng thái ban đầu]
    ↓ (0.3s delay)
[Stage 1] Envelope trồi lên từ dưới màn hình (1.5s)
    ↓ (0.1s delay)
[Stage 2] Nắp phong bì (flap) mở ra (0.6s)
    ↓ (chồng lấp 0.3s)
[Stage 3] Lá thư trồi lên từ bên trong phong bì (1s)
    ↓ (chồng lấp 0.3s)
[Stage 4] Scroll indicator xuất hiện (0.5s)
```

### Tổng thời gian animation
~2.6 giây (từ lúc page load đến khi hoàn tất)

---

## 2. Dependencies

### GSAP (GreenSock Animation Platform)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
```

### Google Fonts (tùy chọn)
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

---

## 3. Cấu trúc SVG

### Yêu cầu SVG
SVG cần được chia thành **3 layer riêng biệt** với các ID cụ thể:

```
envelope.svg
├── #back (Layer 1 - Z-index thấp nhất)
│   ├── #background (mặt sau phong bì)
│   └── #flap (nắp phong bì - có animation xoay)
├── #letter (Layer 2 - Z-index giữa)
│   ├── #letter-background (nền lá thư)
│   └── #Title (nội dung text trên thư)
└── #front (Layer 3 - Z-index cao nhất)
    └── #upper (mặt trước phong bì)
```

### Các ID bắt buộc
| ID | Mô tả | Animation |
|----|-------|-----------|
| `#back` | Nhóm chứa mặt sau + nắp | Không |
| `#flap` | Nắp phong bì | RotateX (mở ra) |
| `#letter` | Nhóm chứa lá thư | TranslateY (trồi lên) |
| `#front` | Mặt trước phong bì | Không |

### ViewBox gốc
```
viewBox="0 0 1260 998"
```
- Width gốc: 1260px
- Height gốc: 998px
- Tỷ lệ: 1260:998 ≈ 1.262:1

---

## 4. Cấu trúc HTML

### Container Structure
```html
<div class="hero-viewport">
    <div class="envelope-wrapper">
        <!-- Layer 1: Back -->
        <svg class="envelope-layer svg-back">...</svg>
        
        <!-- Layer 2: Letter -->
        <svg class="envelope-layer svg-letter">...</svg>
        
        <!-- Layer 3: Front -->
        <svg class="envelope-layer svg-front">...</svg>
    </div>
    
    <div class="scroll-indicator">Scroll to explore</div>
</div>
```

### Giải thích các class
| Class | Mục đích |
|-------|----------|
| `.hero-viewport` | Container chính, chiếm 100vh, overflow hidden |
| `.envelope-wrapper` | Wrapper chứa 3 SVG layers, có position absolute |
| `.envelope-layer` | Class chung cho mỗi SVG layer |
| `.svg-back` | Layer mặt sau (z-index: 1) |
| `.svg-letter` | Layer lá thư (z-index: 2) |
| `.svg-front` | Layer mặt trước (z-index: 3) |
| `.scroll-indicator` | Text + animation pulse ở bottom |

---

## 5. CSS Styling

### 5.1 Body & Overflow
```css
body {
    overflow: hidden; /* Ẩn thanh cuộn */
}

.hero-viewport {
    width: 100%;
    height: 100vh;
    overflow: hidden; /* Ẩn nội dung tràn */
    position: relative;
}
```

### 5.2 Envelope Wrapper - Vị trí ban đầu
```css
.envelope-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 200%); /* Vị trí ban đầu: dưới màn hình */
    width: 1080px;  /* Kích thước mặc định */
    height: 998px;
}
```

**Giải thích `transform: translate(-50%, 200%)`:**
- `-50%` (X): Căn giữa theo chiều ngang
- `200%` (Y): Đẩy xuống 200% chiều cao của wrapper → nằm dưới màn hình

### 5.3 SVG Layers - Stacking Order
```css
.envelope-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.svg-back   { z-index: 1; } /* Thấp nhất */
.svg-letter { z-index: 2; } /* Giữa */
.svg-front  { z-index: 3; } /* Cao nhất - che lá thư */
```

### 5.4 Flap Transform Origin
```css
#flap {
    transform-origin: 50% 100%; /* Xoay từ cạnh dưới */
    transform-box: fill-box;    /* Origin tính theo bounding box của element */
}
```
**Quan trọng:** `transform-origin: 50% 100%` làm cho nắp xoay từ cạnh dưới (như mở nắp thật).

---

## 6. GSAP Animation

### 6.1 Element Selectors
```javascript
const envelopeWrapper = document.querySelector('.envelope-wrapper');
const letterGroup = document.querySelector('#letter');
const flap = document.querySelector('#flap');
const scrollIndicator = document.querySelector('.scroll-indicator');
```

### 6.2 Trạng thái ban đầu của Letter
```javascript
gsap.set(letterGroup, { y: 350 });
```
| Giá trị | Behavior |
|---------|----------|
| `y: 350` | Letter bị đẩy xuống 350px (ẩn trong phong bì) |
| Tăng số | Letter ẩn sâu hơn |
| Giảm số | Letter lộ ra nhiều hơn ngay từ đầu |

### 6.3 Timeline Configuration
```javascript
const mainTimeline = gsap.timeline({
    defaults: {
        ease: 'power2.out' // Ease mặc định cho tất cả animations
    },
    delay: 0.3 // Chờ 0.3s trước khi bắt đầu
});
```

### 6.4 Stage 1: Envelope Entrance
```javascript
mainTimeline.to(envelopeWrapper, {
    y: '-40%',        // Vị trí cuối: trồi lên 40% từ center
    duration: 1.5,    // Thời gian: 1.5 giây
    ease: 'power3.out' // Ease: nhanh đầu, chậm cuối
});
```
| Thuộc tính | Giá trị | Mô tả |
|------------|---------|-------|
| `y` | `'-40%'` | Vị trí cuối cùng của envelope (% tính từ vị trí gốc) |
| `duration` | `1.5` | Thời gian animation (giây) |
| `ease` | `'power3.out'` | Kiểu easing - mượt, không giật |

**Các giá trị `y` khác:**
- `'-50%'`: Envelope cao hơn
- `'-30%'`: Envelope thấp hơn
- `'0%'`: Envelope ở chính giữa màn hình

### 6.5 Stage 2: Flap Opens
```javascript
mainTimeline.to(flap, {
    rotateX: -160,      // Xoay -160 độ (mở ra phía sau)
    duration: 0.6,      // Thời gian: 0.6 giây
    ease: 'power2.inOut' // Ease: mượt cả đầu và cuối
}, '+=0.1');             // Delay: +0.1s sau Stage 1
```
| Thuộc tính | Giá trị | Mô tả |
|------------|---------|-------|
| `rotateX` | `-160` | Góc xoay theo trục X (độ) |
| `'+=0.1'` | Position parameter | Bắt đầu sau 0.1s kể từ khi Stage 1 kết thúc |

### 6.6 Stage 3: Letter Rise
```javascript
mainTimeline.to(letterGroup, {
    y: -80,            // Vị trí cuối: trồi lên 80px
    duration: 1,       // Thời gian: 1 giây
    ease: 'power3.out' // Ease: mượt
}, '-=0.3');           // Overlap: bắt đầu 0.3s TRƯỚC KHI Stage 2 kết thúc
```
| Thuộc tính | Giá trị | Mô tả |
|------------|---------|-------|
| `y` | `-80` | Vị trí cuối của letter (px, âm = lên trên) |
| `'-=0.3'` | Position parameter | Chồng lấp 0.3s với animation trước |

**Điều chỉnh vị trí letter:**
- Ban đầu: `gsap.set(letterGroup, { y: 350 })` → Letter ẩn sâu 350px
- Khi trồi lên: `y: -80` → Letter trồi lên 80px so với vị trí gốc
- Tổng quãng đường: 350 + 80 = 430px

### 6.7 Stage 4: Scroll Indicator
```javascript
mainTimeline.to(scrollIndicator, {
    opacity: 1,    // Hiện lên
    duration: 0.5, // Thời gian: 0.5 giây
}, '-=0.3');       // Overlap với Stage 3
```

### 6.8 Position Parameters Cheat Sheet
| Giá trị | Ý nghĩa |
|---------|---------|
| `'+=0.5'` | Bắt đầu 0.5s SAU KHI animation trước kết thúc |
| `'-=0.3'` | Bắt đầu 0.3s TRƯỚC KHI animation trước kết thúc (overlap) |
| `'<'` | Bắt đầu cùng lúc với animation trước |
| `'<0.5'` | Bắt đầu 0.5s sau khi animation trước BẮT ĐẦU |
| `2` | Bắt đầu tại thời điểm 2s của timeline |

---

## 7. SVG Image Patterns

### 7.1 Tổng quan

Project sử dụng SVG `<pattern>` để fill các file ảnh WebP vào các path tương ứng. Cách này giữ nguyên shape, animation và z-index của các layer.

### 7.2 Cấu trúc file ảnh

| File ảnh | Target Path | Pattern ID | Layer |
|----------|------------|------------|-------|
| `back-background.webp` | `#background` | `pattern-background` | Back (Layer 1) |
| `flap.webp` | `#flap` | `pattern-flap` | Back (Layer 1) |
| `letter.webp` | `#letter-background` (path đầu tiên) | `pattern-letter` | Letter (Layer 2) |
| `front.webp` | `#upper` | `pattern-front` | Front (Layer 3) |

### 7.3 Cấu trúc Pattern trong SVG

Mỗi SVG layer có một `<defs>` section chứa các pattern:

```html
<!-- Layer 1: Back -->
<svg class="envelope-layer svg-back" viewBox="0 0 1260 998">
    <defs>
        <pattern id="pattern-background" patternUnits="userSpaceOnUse" width="1260" height="998" x="0" y="0">
            <image href="back-background.webp" width="1260" height="998" preserveAspectRatio="xMidYMid slice"/>
        </pattern>
        <pattern id="pattern-flap" patternUnits="userSpaceOnUse" width="1260" height="998" x="0" y="0">
            <image href="flap.webp" width="1260" height="998" preserveAspectRatio="xMidYMid slice"/>
        </pattern>
    </defs>
    <g id="back">
        <path id="background" d="..." fill="url(#pattern-background)"/>
        <path id="flap" d="..." fill="url(#pattern-flap)"/>
    </g>
</svg>
```

### 7.4 Pattern Attributes

| Attribute | Giá trị | Mô tả |
|-----------|---------|-------|
| `patternUnits` | `"userSpaceOnUse"` | Pattern sử dụng hệ tọa độ của viewBox (không phải bounding box của path) |
| `width` | `1260` | Chiều rộng pattern = viewBox width |
| `height` | `998` | Chiều cao pattern = viewBox height |
| `x`, `y` | `0` | Vị trí bắt đầu của pattern |
| `preserveAspectRatio` | `"xMidYMid slice"` | Ảnh scale để fill toàn bộ pattern, cắt phần thừa |

### 7.5 Áp dụng Pattern vào Path

Thay đổi `fill` attribute từ màu solid sang `url(#pattern-id)`:

```html
<!-- Trước -->
<path id="background" d="..." fill="#B8B7B7"/>

<!-- Sau -->
<path id="background" d="..." fill="url(#pattern-background)"/>
```

### 7.6 Lưu ý kỹ thuật

1. **Pattern Units**: Sử dụng `patternUnits="userSpaceOnUse"` để pattern có kích thước cố định theo viewBox, không phụ thuộc vào kích thước của path.

2. **Preserve Aspect Ratio**: 
   - `xMidYMid slice`: Ảnh scale để fill toàn bộ pattern, giữ tỷ lệ, cắt phần thừa
   - `xMidYMid meet`: Ảnh scale để fit trong pattern, có thể để trống

3. **Animation Compatibility**: 
   - Pattern fill không ảnh hưởng đến animation của path
   - `#flap` vẫn có thể rotateX bình thường
   - `#letter` vẫn có thể translateY bình thường

4. **File Path**: 
   - Đảm bảo file ảnh WebP nằm cùng thư mục với `index.html`
   - Hoặc sử dụng đường dẫn tương đối/absolute đúng

### 7.7 Tùy chỉnh Pattern

**Điều chỉnh vị trí ảnh trong pattern:**
```html
<pattern id="pattern-background" patternUnits="userSpaceOnUse" width="1260" height="998" x="-100" y="-50">
    <!-- x, y âm = dịch ảnh sang trái/lên trên -->
</pattern>
```

**Điều chỉnh kích thước ảnh:**
```html
<image href="back-background.webp" width="1500" height="1200" preserveAspectRatio="xMidYMid slice"/>
<!-- Tăng width/height = ảnh lớn hơn, có thể bị crop nhiều hơn -->
```

**Sử dụng patternContentUnits (tùy chọn):**
```html
<pattern id="pattern-background" 
         patternUnits="userSpaceOnUse" 
         patternContentUnits="objectBoundingBox"
         width="1" height="1">
    <!-- patternContentUnits="objectBoundingBox" = pattern scale theo bounding box của path -->
</pattern>
```

---

## 8. Responsive Breakpoints

### Bảng kích thước
| Màn hình | Width | Height | Ghi chú |
|----------|-------|--------|---------|
| >= 1920px | 1440px | 1140px | Màn hình 21" trở lên |
| 1330px - 1919px | 1080px | 998px | Kích thước mặc định |
| < 1330px | 90vw | auto (tỷ lệ) | Tablet/Laptop nhỏ |
| < 768px | 95vw | auto (tỷ lệ) | Mobile |

### CSS Media Queries
```css
/* Màn hình lớn >= 1920px */
@media (min-width: 1920px) {
    .envelope-wrapper {
        width: 1440px;
        height: 1140px;
    }
}

/* Màn hình < 1330px */
@media (max-width: 1330px) {
    .envelope-wrapper {
        width: 90vw;
        height: calc(90vw * 0.792); /* Tỷ lệ 998/1260 = 0.792 */
    }
}

/* Mobile < 768px */
@media (max-width: 768px) {
    .envelope-wrapper {
        width: 95vw;
        height: calc(95vw * 0.792);
    }
}
```

### Công thức tính height giữ tỷ lệ
```
height = width × (998 / 1260)
height = width × 0.792
```

---

## 9. Customization Guide

### 8.1 Thay đổi vị trí ban đầu của Envelope
**File:** `index.html` → CSS `.envelope-wrapper`
```css
transform: translate(-50%, 200%);
/*                         ↑ Thay đổi số này */
```
| Giá trị | Kết quả |
|---------|---------|
| `100%` | Envelope lộ nhiều hơn ban đầu |
| `200%` | Envelope gần như ẩn hoàn toàn |
| `300%` | Envelope ẩn hoàn toàn, xa hơn |

### 8.2 Thay đổi vị trí cuối của Envelope (sau khi trồi lên)
**File:** `index.html` → JavaScript Stage 1
```javascript
mainTimeline.to(envelopeWrapper, {
    y: '-40%', // ← Thay đổi số này
    ...
});
```
| Giá trị | Kết quả |
|---------|---------|
| `'-50%'` | Envelope cao hơn |
| `'-40%'` | Mặc định |
| `'-20%'` | Envelope thấp hơn |
| `'0%'` | Envelope ở giữa màn hình |

### 8.3 Thay đổi vị trí ban đầu của Letter
**File:** `index.html` → JavaScript Initial State
```javascript
gsap.set(letterGroup, { y: 350 }); // ← Thay đổi số này
```
| Giá trị | Kết quả |
|---------|---------|
| `200` | Letter lộ một phần ngay từ đầu |
| `350` | Mặc định - Letter ẩn hoàn toàn |
| `500` | Letter ẩn sâu hơn |

### 8.4 Thay đổi vị trí Letter khi trồi lên
**File:** `index.html` → JavaScript Stage 3
```javascript
mainTimeline.to(letterGroup, {
    y: -80, // ← Thay đổi số này
    ...
});
```
| Giá trị | Kết quả |
|---------|---------|
| `-150` | Letter trồi cao hơn |
| `-80` | Mặc định |
| `-30` | Letter trồi ít hơn |
| `0` | Letter ở vị trí gốc (không trồi) |

### 8.5 Thay đổi tốc độ Animation
**File:** `index.html` → JavaScript

```javascript
// Delay ban đầu
delay: 0.3 // Giảm = nhanh hơn, Tăng = chậm hơn

// Duration của từng stage
duration: 1.5 // Giây - Giảm = nhanh hơn

// Overlap giữa các stage
}, '-=0.3'); // Tăng số = overlap nhiều hơn = tổng thời gian ngắn hơn
```

### 8.6 Thay đổi Easing
| Ease | Behavior |
|------|----------|
| `'power1.out'` | Nhẹ nhàng |
| `'power2.out'` | Trung bình |
| `'power3.out'` | Mạnh hơn |
| `'power4.out'` | Rất mạnh |
| `'back.out(1.7)'` | Đi quá rồi giật lại |
| `'elastic.out(1, 0.3)'` | Đàn hồi |
| `'bounce.out'` | Nảy |

### 8.7 Thay đổi kích thước Envelope
**File:** `index.html` → CSS `.envelope-wrapper`
```css
width: 1080px;
height: 998px;
```
**Lưu ý:** Giữ tỷ lệ `height = width × 0.792`

---

## 10. Troubleshooting

### 9.1 Envelope bay đi mất
**Nguyên nhân:** Floating animation dùng giá trị tương đối (`y: '-=15'`)
**Giải pháp:** Đã tắt floating animation hoặc dùng giá trị tuyệt đối

### 9.2 Letter không ẩn hoàn toàn ban đầu
**Nguyên nhân:** Giá trị `y` trong `gsap.set()` quá nhỏ
**Giải pháp:** Tăng giá trị lên (vd: 300, 350, 400)

### 9.3 Flap không xoay đúng
**Nguyên nhân:** Thiếu `transform-origin` và `transform-box`
**Giải pháp:**
```css
#flap {
    transform-origin: 50% 100%;
    transform-box: fill-box;
}
```

### 9.4 Animation không chạy
**Checklist:**
1. Kiểm tra GSAP CDN đã load chưa
2. Kiểm tra các selector ID có đúng không (`#letter`, `#flap`)
3. Kiểm tra Console có lỗi không
4. Đảm bảo code nằm trong `DOMContentLoaded`

### 10.5 Thanh cuộn xuất hiện
**Giải pháp:**
```css
body { overflow: hidden; }
.hero-viewport { overflow: hidden; }
```

### 10.6 Ảnh không hiển thị trong pattern
**Nguyên nhân có thể:**
1. File path không đúng
2. File ảnh không tồn tại
3. Browser không hỗ trợ WebP (hiếm)

**Giải pháp:**
1. Kiểm tra file path trong `href` attribute
2. Đảm bảo file ảnh nằm cùng thư mục với `index.html`
3. Kiểm tra Console có lỗi 404 không
4. Thử đổi sang định dạng PNG/JPG để test

### 10.7 Ảnh không khớp với path
**Nguyên nhân:** Pattern size hoặc preserveAspectRatio không phù hợp

**Giải pháp:**
1. Điều chỉnh `width` và `height` của pattern
2. Thử đổi `preserveAspectRatio` từ `slice` sang `meet`
3. Điều chỉnh `x`, `y` của pattern để dịch ảnh
4. Kiểm tra tỷ lệ ảnh gốc có khớp với viewBox không

---

## Tác giả & Phiên bản

- **Version:** 1.0
- **Last Updated:** January 2026
- **GSAP Version:** 3.12.5

---

## Quick Start Checklist

- [ ] SVG có đủ các ID: `#back`, `#flap`, `#letter`, `#front`
- [ ] GSAP CDN đã được thêm
- [ ] CSS có `overflow: hidden` cho body và viewport
- [ ] CSS có `transform-origin` cho `#flap`
- [ ] JavaScript có `gsap.set()` cho trạng thái ban đầu của letter
- [ ] Kích thước responsive đã được cấu hình
- [ ] File ảnh WebP đã được thêm vào thư mục (`back-background.webp`, `flap.webp`, `letter.webp`, `front.webp`)
- [ ] SVG patterns đã được định nghĩa trong `<defs>` của mỗi layer
- [ ] Fill attributes đã được cập nhật sang `url(#pattern-id)`
