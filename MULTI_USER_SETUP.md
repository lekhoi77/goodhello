# Multi-User Setup - Implementation Guide

## Overview
The website now supports 5 users with dynamic content loading based on subdomain detection. Each user can have their own stamps, titles, and future details sections.

## Users Configured
1. **phatla** (default) - Complete with 6 stamps
2. **lefacteur** - Ready for stamps to be added
3. **hoangkaa** - Ready for stamps to be added
4. **huukhai** - Ready for stamps to be added
5. **vinhnghi** - Ready for stamps to be added

## File Structure

```
goodhello/
├── asset/
│   ├── data/
│   │   └── users-data.json          # Central data file for all users
│   ├── js/
│   │   └── user-loader.js           # Dynamic loading script
│   ├── stamp/
│   │   ├── phatla/                  # Existing stamps
│   │   │   ├── stamp-phatla-1.png
│   │   │   └── ... (6 stamps total)
│   │   ├── lefacteur/               # Add your stamps here
│   │   ├── hoangkaa/                # Add your stamps here
│   │   ├── huukhai/                 # Add your stamps here
│   │   └── vinhnghi/                # Add your stamps here
│   └── ...
└── index.html                        # Updated with dynamic rendering
```

## How It Works

### 1. Subdomain Detection
The system automatically detects which user to display based on the subdomain:

- `phatla.goodhello.com` → Shows Phat La's content
- `lefacteur.goodhello.com` → Shows Le Facteur's content
- `hoangkaa.goodhello.com` → Shows Hoang Kaa's content
- `huukhai.goodhello.com` → Shows Huu Khai's content
- `vinhnghi.goodhello.com` → Shows Vinh Nghi's content
- `localhost` or `goodhello.com` → Defaults to Phat La

### 2. Testing Locally
You can test different users locally using URL parameters:
```
http://localhost:8000/index.html?user=lefacteur
http://localhost:8000/index.html?user=hoangkaa
```

### 3. Data Structure
All user data is stored in `asset/data/users-data.json`:

```json
{
  "username": {
    "mainTitle": "A 3-year<br>journey",
    "stamps": [
      {
        "src": "asset/stamp/username/stamp-username-1.png",
        "alt": "Username 1",
        "title": "Username 1"
      }
    ],
    "details": null  // Reserved for future stamp details section
  }
}
```

## Adding Stamps for New Users

### Step 1: Prepare Stamp Images
Create a folder for each user and add 6 stamp images:
```
asset/stamp/lefacteur/
  ├── stamp-lefacteur-1.png
  ├── stamp-lefacteur-2.png
  ├── stamp-lefacteur-3.png
  ├── stamp-lefacteur-4.png
  ├── stamp-lefacteur-5.png
  └── stamp-lefacteur-6.png
```

### Step 2: Update Data (Optional)
The data structure is already set up in `users-data.json`. If you want to customize:
- Change `mainTitle` for different section titles
- Update stamp titles in the `title` field
- Modify `alt` text for accessibility

## Customizing Per User

### Different Main Titles
Edit `users-data.json` to change the main section title:
```json
"lefacteur": {
  "mainTitle": "Un voyage de<br>3 ans",
  "stamps": [...]
}
```

### Different Stamp Titles
Each stamp can have a unique hover title:
```json
{
  "src": "asset/stamp/lefacteur/stamp-lefacteur-1.png",
  "alt": "Le Facteur Year 1",
  "title": "Le Facteur Year 1"
}
```

## Future: Stamp Details Section

The system is ready for a future details section. The `details` field in each user's data is reserved for this:

```json
"details": {
  "description": "Detailed information about this user's journey",
  "sections": [
    {
      "stampId": 1,
      "content": "Details for stamp 1",
      "images": []
    }
  ]
}
```

When you're ready to implement the details section:
1. Design the UI/layout
2. Add HTML structure in `index.html` (marked with TODO comment)
3. Populate `details` in `users-data.json`
4. Add rendering logic in JavaScript

## Subdomain Setup for Production

### DNS Configuration
Add wildcard A record in your DNS provider:
```
Type: A
Name: *
Value: [Your Server IP]
TTL: 3600
```

This will route all subdomains (phatla.goodhello.com, lefacteur.goodhello.com, etc.) to your server.

### Server Configuration
Your web server should serve the same `index.html` for all subdomains. The JavaScript will handle routing client-side.

**Example (Nginx):**
```nginx
server {
    server_name *.goodhello.com goodhello.com;
    root /path/to/goodhello;
    index index.html;
}
```

**Example (Apache):**
```apache
<VirtualHost *:80>
    ServerName goodhello.com
    ServerAlias *.goodhello.com
    DocumentRoot /path/to/goodhello
</VirtualHost>
```

## Features Maintained

✅ Envelope animation (same for all users)
✅ Circular stamp layout
✅ Hover title changes
✅ Entrance animations
✅ Mobile responsive scrolling
✅ Navigation hide/show on scroll
✅ No shadow on stamp hover (as customized)
✅ Primary-500 color for section title (as customized)

## Development Tips

1. **Testing Different Users**: Use URL parameter `?user=username`
2. **Check Console**: The script logs the detected user for debugging
3. **Fallback**: If user not found, shows default (phatla) data
4. **Images Loading**: Ensure stamp images exist before testing
5. **Browser Cache**: Clear cache if changes don't appear

## Next Steps

1. **Add Stamp Images**: Create folders and add images for the 4 remaining users
2. **Customize Titles**: Update `users-data.json` if you want different titles per user
3. **Test Locally**: Use URL parameters to verify each user's content
4. **Deploy**: Configure DNS and web server for subdomain routing
5. **Future**: Design and implement the stamp details section when ready

## Troubleshooting

**Stamps not showing?**
- Check browser console for errors
- Verify stamp image paths in `users-data.json`
- Ensure images exist in the correct folders

**Wrong user data loading?**
- Check console log for detected user
- Verify subdomain spelling matches exactly
- Try URL parameter: `?user=username`

**Animations not working?**
- Ensure GSAP library is loading
- Check console for JavaScript errors
- Verify all script tags are in correct order

## Support for 6 Stamps Per User

The system is optimized for 6 stamps per user with:
- Fixed rotation angles: [-5, 3, -7, 4, -3, 6] degrees
- Circular layout with 380px radius
- Custom Y-axis offsets for stamps 1 and 4
- Staggered entrance animation (150ms between each)

If you need a different number of stamps per user, the system will adapt automatically, but you may want to adjust the layout parameters in the JavaScript.
