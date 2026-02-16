# Thêm action "addWish" vào Google Apps Script

Để chức năng **gửi lời chúc từ console** (`submitWish("...")`) ghi được vào Google Sheet, bạn cần thêm xử lý `addWish` trong **Apps Script** (Extensions > Apps Script, mở file Code.gs).

## 1. Trong hàm `doPost(e)`, thêm nhánh cho addWish

Tìm đoạn:

```javascript
if (data.action === 'recordVisit') {
  return recordVisit(sheet, data);
}
return buildResponse(false, 'Invalid action');
```

Đổi thành:

```javascript
if (data.action === 'recordVisit') {
  return recordVisit(sheet, data);
}
if (data.action === 'addWish') {
  return addWish(sheet, data);
}
return buildResponse(false, 'Invalid action');
```

## 2. Thêm hàm addWish (đặt cùng file Code.gs)

```javascript
function addWish(sheet, data) {
  var host = data.host;
  var guestName = data.guestName;
  var message = (data.message || '').trim();
  var timestamp = new Date().toISOString();

  if (!host || !message) {
    return buildResponse(false, 'Missing host or message');
  }
  if (!guestName) {
    guestName = 'Guest';
  }

  var existingRow = findExistingVisit(sheet, host, guestName);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 3).setValue(message);
    sheet.getRange(existingRow, 4).setValue(timestamp);
    return buildResponse(true, 'Wish updated', { rowId: existingRow });
  }
  sheet.appendRow([host, guestName, message, timestamp]);
  var lastRow = sheet.getLastRow();
  return buildResponse(true, 'Wish added', { rowId: lastRow });
}
```

Lưu (Ctrl+S), sau đó **Deploy > Manage deployments > Edit (bút) > Version: New version > Deploy**. URL Web App giữ nguyên.

---

Sau khi thêm xong, trên website mở **Console (F12)** và gõ:

```javascript
submitWish("Chúc mừng tốt nghiệp!")
```

Lời chúc sẽ được ghi vào Sheet (cột message) cho host hiện tại và tên guest đã lưu.
