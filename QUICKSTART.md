# Quick Start: Adding Stamps for New Users

## Current Status
✅ System is fully configured for 5 users
✅ Folders created for all users
✅ Phatla's stamps already working

## Your Next Steps

### 1. Add Stamp Images
Place 6 stamp images in each user's folder:

```
asset/stamp/lefacteur/
  ├── stamp-lefacteur-1.png
  ├── stamp-lefacteur-2.png
  ├── stamp-lefacteur-3.png
  ├── stamp-lefacteur-4.png
  ├── stamp-lefacteur-5.png
  └── stamp-lefacteur-6.png

asset/stamp/hoangkaa/
  ├── stamp-hoangkaa-1.png
  └── ... (6 total)

asset/stamp/huukhai/
  ├── stamp-huukhai-1.png
  └── ... (6 total)

asset/stamp/vinhnghi/
  ├── stamp-vinhnghi-1.png
  └── ... (6 total)
```

**Important**: Image names must match exactly as shown in `asset/data/users-data.json`

### 2. Test Locally
Open in browser with URL parameter:
```
index.html?user=phatla       (should work now)
index.html?user=lefacteur    (will work after adding images)
index.html?user=hoangkaa     (will work after adding images)
index.html?user=huukhai      (will work after adding images)
index.html?user=vinhnghi     (will work after adding images)
```

### 3. Customize Titles (Optional)
Edit `asset/data/users-data.json` to change:
- Main section title (`mainTitle`)
- Individual stamp hover titles (`title`)
- Alt text for accessibility (`alt`)

### 4. Deploy with Subdomains
After testing, configure your domain:
1. Add DNS wildcard: `*.goodhello.com` → Your server
2. Configure web server to serve same files for all subdomains
3. Access via: `phatla.goodhello.com`, `lefacteur.goodhello.com`, etc.

## Files You Created
- ✅ `asset/data/users-data.json` - All user data
- ✅ `asset/js/user-loader.js` - Dynamic loading script
- ✅ `index.html` - Updated with dynamic rendering
- ✅ `asset/stamp/[username]/` - Folders for all users
- ✅ `MULTI_USER_SETUP.md` - Full documentation

## Need Help?
See `MULTI_USER_SETUP.md` for complete documentation and troubleshooting.
