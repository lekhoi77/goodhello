# 🎵 Audio Files Guide

## 📁 Folder Structure

```
asset/audio/
├── bg/                     # Background Music (2-4 minutes, loopable)
│   ├── graduation-theme.mp3
│   ├── nostalgic-melody.mp3
│   └── soft-ambient.mp3
├── sfx/                    # Sound Effects (0.5-2 seconds)
│   ├── envelope-open.mp3
│   ├── stamp-hover.mp3
│   ├── stamp-click.mp3
│   ├── notification.mp3
│   ├── wish-drop.mp3
│   └── button-click.mp3
└── voice/                  # Voice Messages (Optional)
    ├── phatla-greeting.mp3
    └── hoangkaa-greeting.mp3
```

## 🎶 Background Music Requirements

### `bg/graduation-theme.mp3`
- **Purpose**: Main graduation celebration music
- **Duration**: 2-4 minutes
- **Style**: Uplifting, celebratory, orchestral/acoustic
- **Format**: MP3, 128kbps
- **Loop**: Must loop seamlessly
- **Volume**: Normalized to -12dB

### `bg/nostalgic-melody.mp3`
- **Purpose**: Emotional, memory-focused track
- **Duration**: 3-5 minutes  
- **Style**: Soft, nostalgic, piano or strings
- **Format**: MP3, 128kbps
- **Loop**: Must loop seamlessly

### `bg/soft-ambient.mp3`
- **Purpose**: Calm background for reading
- **Duration**: 4-6 minutes
- **Style**: Ambient, atmospheric, minimal
- **Format**: MP3, 128kbps
- **Loop**: Must loop seamlessly

## 🔊 Sound Effects Requirements

### `sfx/envelope-open.mp3`
- **Purpose**: Hero section envelope lifting animation
- **Duration**: 1-2 seconds
- **Style**: Paper rustling, gentle whoosh
- **Format**: MP3, 64kbps
- **Timing**: Plays when envelope moves up

### `sfx/stamp-hover.mp3`
- **Purpose**: Stamp hover feedback (desktop)
- **Duration**: 0.3-0.5 seconds
- **Style**: Subtle click/tap sound
- **Format**: MP3, 64kbps
- **Volume**: Quiet (30% of music volume)

### `sfx/stamp-click.mp3`
- **Purpose**: Stamp click to open details
- **Duration**: 0.5-1 second
- **Style**: Satisfying click/pop sound
- **Format**: MP3, 64kbps
- **Used for**: Stamp clicks, flap opening

### `sfx/notification.mp3`
- **Purpose**: Toast notifications and alerts
- **Duration**: 0.5-1 second
- **Style**: Gentle chime or bell
- **Format**: MP3, 64kbps
- **Used for**: Success messages, invitations appearing

### `sfx/wish-drop.mp3`
- **Purpose**: Wish papers falling animation
- **Duration**: 1-1.5 seconds
- **Style**: Paper flutter, soft landing
- **Format**: MP3, 64kbps
- **Used for**: Wish cards animation, letter sliding

### `sfx/button-click.mp3`
- **Purpose**: General button interactions
- **Duration**: 0.2-0.4 seconds
- **Style**: Clean UI click sound
- **Format**: MP3, 64kbps
- **Used for**: Various button clicks

## 🎤 Voice Messages (Optional)

### `voice/phatla-greeting.mp3`
- **Purpose**: Personal greeting for Phat La's page
- **Duration**: 10-30 seconds
- **Content**: "Hi! Welcome to my graduation invitation..."
- **Format**: MP3, 96kbps

### `voice/hoangkaa-greeting.mp3`
- **Purpose**: Personal greeting for Hoang Kaa's page
- **Duration**: 10-30 seconds
- **Content**: Custom greeting message
- **Format**: MP3, 96kbps

## 🎛️ Audio Control Features

### Current Implementation:
- ✅ Play/Pause background music
- ✅ Track selection dropdown
- ✅ Volume control (programmatic)
- ✅ Auto-pause when tab is hidden
- ✅ User preference storage
- ✅ Sound effects integration
- ✅ Mobile responsive controls

### User Controls:
- **Music Button**: Toggle background music on/off
- **Track Selector**: Choose between 3 background tracks
- **Auto-Memory**: Remembers user's music preference
- **Smart Volume**: SFX at 70% of music volume

## 🔧 Technical Notes

### Audio Format Support:
- **Primary**: MP3 (universal support)
- **Fallback**: OGG (not implemented, but recommended)
- **Avoid**: WAV (too large), M4A (limited support)

### Performance Optimization:
- Background music: `preload="metadata"`
- Sound effects: `preload="auto"`  
- Smart loading after first user interaction
- Audio files cached by browser

### Browser Requirements:
- **Auto-play**: Only works after user interaction
- **Loop**: Seamless looping for background music
- **Volume**: Programmatically controlled
- **Format**: MP3 supported in all modern browsers

## 🎯 Recommended Audio Sources

### Free Music:
- **Pixabay Music**: royalty-free graduation themes
- **Freesound**: sound effects library
- **YouTube Audio Library**: background music
- **Zapsplat**: professional SFX (with account)

### Paid Options:
- **AudioJungle**: high-quality tracks
- **Epidemic Sound**: subscription service
- **Artlist**: filmmaker-focused library

## 📋 Testing Checklist

- [ ] All audio files load without errors
- [ ] Background music loops seamlessly  
- [ ] Sound effects play at correct moments
- [ ] Audio controls work on desktop and mobile
- [ ] Volume levels are balanced
- [ ] User preferences are saved
- [ ] No audio conflicts or overlapping
- [ ] Graceful handling of missing files

## 🚀 Quick Start

1. **Add audio files** to respective folders
2. **Test in browser** - open developer console
3. **Check console logs** for loading confirmation
4. **Interact with page** to trigger audio
5. **Test audio controls** in navigation bar
6. **Verify mobile experience**

---

**Status**: ✅ Audio system fully implemented and ready for audio files!