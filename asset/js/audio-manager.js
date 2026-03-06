/**
 * Audio Manager - Background music and sound effects system
 * Handles music playback, sound effects, and user preferences
 */

class AudioManager {
    constructor() {
        this.isInitialized = false;
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 0.5;
        this.tracks = {};
        this.soundEffects = {};
        
        // Audio preferences from localStorage
        this.preferences = {
            enabled: localStorage.getItem('audioEnabled') !== 'false',
            currentTrackId: 'motthoi-truantfu',
            volume: parseFloat(localStorage.getItem('audioVolume')) || 0.2 // Default 20%
        };

        // Track definitions (use paths without spaces for reliability)
        this.trackList = [
            {
                id: 'motthoi-truantfu',
                name: 'motthoi-truantfu',
                file: './asset/audio/bg/motthoi-truantfu.mp3',
                displayName: 'motthoi-truantfu'
            },
            {
                id: 'soulful-mie',
                name: 'soulful_mie',
                file: './asset/audio/bg/soulful_mie.mp3',
                displayName: 'soulful_mie'
            },
            {
                id: 'huuhan-lefacteur',
                name: 'huuhan-lefacteur',
                file: './asset/audio/bg/huuhan-lefacteur.mp3',
                displayName: 'huuhan-lefacteur'
            },
            {
                id: 'myyoshi-brianjcb',
                name: 'myyoshi- brianjcb',
                file: './asset/audio/bg/myyoshi- brianjcb.mp3',
                displayName: 'myyoshi-brianjcb'
            },
            {
                id: 'why-dominicfike',
                name: 'why -dominicfike',
                file: './asset/audio/bg/why -dominicfike.mp3',
                displayName: 'why-dominicfike'
            },
            {
                id: 'lemonade-klickaud',
                name: 'lemonade_KLICKAUD',
                file: './asset/audio/bg/lemonade_KLICKAUD.mp3',
                displayName: 'lemonade-KLICKAUD'
            },
            {
                id: 'nhunggiaidieukhac-minhtoc-lam',
                name: 'nhunggiaidieukhac-minhtoc&lam',
                file: './asset/audio/bg/nhunggiaidieukhac-minhtoc&lam.mp3',
                displayName: 'nhunggiaidieukhac-minhtoc&lam'
            },  
            {
                id: 'motlantoiradoi-thaidinh',
                name: 'motlantoiradoi-thaidinh',
                file: './asset/audio/bg/motlantoiradoi-thaidinh.mp3',
                displayName: 'motlantoiradoi-thaidinh'
            },
            {
                id: 'neverbealone-lefthand',
                name: 'neverbealone-lefthand',
                file: './asset/audio/bg/neverbealone-lefthand.mp3',
                displayName: 'neverbealone-lefthand'
            }
        ];

        // Sound effects definitions
        this.sfxList = [
            { id: 'envelope-open', file: 'asset/audio/sfx/envelope-open.mp3' },
            { id: 'stamp-hover', file: 'asset/audio/sfx/stamp-hover.mp3' },
            { id: 'stamp-click', file: 'asset/audio/sfx/stamp-click.mp3' },
            { id: 'notification', file: 'asset/audio/sfx/notification.mp3' },
            { id: 'wish-drop', file: 'asset/audio/sfx/wish-drop.mp3' },
            { id: 'button-click', file: 'asset/audio/sfx/button-click.mp3' }
        ];

        this.volume = this.preferences.volume;
        this.bind();
        
        // Apply default volume to slider on load
        this.initVolumeSlider();
    }

    /**
     * Check if device is mobile (hide audio on mobile per user request)
     */
    isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * Initialize audio system after user interaction
     */
    async init() {
        if (this.isInitialized) return;
        if (this.isMobile()) return; // No audio on mobile
        
        console.log('🎵 Initializing Audio Manager...');
        
        try {
            // Load background tracks
            await this.loadTracks();
            
            // Load sound effects
            await this.loadSoundEffects();
            
            // Setup UI
            this.setupUI();
            
            // Start playing if enabled
            if (this.preferences.enabled) {
                await this.playTrack(this.preferences.currentTrackId);
            } else {
                // Still update display even if not playing
                this.updateTrackDisplay();
            }
            
            this.isInitialized = true;
            console.log('✅ Audio Manager initialized successfully');
            
        } catch (error) {
            console.warn('⚠️ Audio Manager initialization failed:', error);
            this.handleAudioError();
        }
    }

    /**
     * Load background music tracks
     */
    async loadTracks() {
        const loadPromises = this.trackList.map((track, index) => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.loop = false;
                audio.volume = this.volume;
                
                audio.addEventListener('ended', () => {
                    if (this.isPlaying) {
                        const nextId = this.getNextTrackId(track.id);
                        this.playTrack(nextId);
                    }
                });
                
                audio.addEventListener('canplaythrough', () => {
                    this.tracks[track.id] = audio;
                    console.log(`🎶 Loaded track: ${track.name}`);
                    resolve();
                });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`❌ Failed to load track: ${track.name}`, e);
                    resolve(); // Don't reject, just continue
                });
                
                // Set source last to trigger loading (encode URI for spaces in filename)
                audio.src = encodeURI(track.file).replace(/#/g, '%23');
            });
        });

        await Promise.all(loadPromises);
    }

    /**
     * Load sound effects
     */
    async loadSoundEffects() {
        const loadPromises = this.sfxList.map(sfx => {
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.volume = this.volume * 0.7; // SFX slightly quieter
                
                audio.addEventListener('canplaythrough', () => {
                    this.soundEffects[sfx.id] = audio;
                    console.log(`🔊 Loaded SFX: ${sfx.id}`);
                    resolve();
                });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`❌ Failed to load SFX: ${sfx.id}`, e);
                    resolve();
                });
                
                audio.src = sfx.file;
            });
        });

        await Promise.all(loadPromises);
    }

    /**
     * Setup UI controls
     */
    setupUI() {
        const audioControl = document.getElementById('audio-control');
        const trackSelector = document.getElementById('track-selector');
        const trackDropdown = document.getElementById('track-dropdown');
        const trackName = document.getElementById('track-name');
        
        if (audioControl) {
            // Update button state
            this.updateButtonState();
            
            // Add click handler for mute/unmute
            audioControl.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMute();
            });
        }
        
        if (trackSelector && trackDropdown) {
            // Set current track display
            this.updateTrackDisplay();
            
            // Add click handler for dropdown
            trackSelector.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTrackDropdown();
            });
            
            // Add track option handlers
            const trackOptions = trackDropdown.querySelectorAll('.track-option');
            trackOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectTrack(option.dataset.value);
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                this.closeTrackDropdown();
            });
        }
    }

    /**
     * Toggle mute/unmute
     */
    async toggleMute() {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.isPlaying) {
            this.mute();
        } else {
            await this.unmute();
        }
    }

    /**
     * Mute audio (pause)
     */
    mute() {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.isPlaying = false;
            this.preferences.enabled = false;
            this.updateButtonState();
            this.savePreferences();
            console.log('🔇 Music muted');
        }
    }

    /**
     * Unmute audio (play)
     */
    async unmute() {
        if (!this.currentTrack) {
            await this.playTrack(this.preferences.currentTrackId);
            return;
        }

        try {
            await this.currentTrack.play();
            this.isPlaying = true;
            this.preferences.enabled = true;
            this.updateButtonState();
            this.savePreferences();
            console.log('🔊 Music unmuted');
        } catch (error) {
            console.warn('⚠️ Failed to unmute audio:', error);
            this.handleAudioError();
        }
    }

    /**
     * Play current track
     */
    async play() {
        return this.unmute();
    }

    /**
     * Pause current track
     */
    pause() {
        this.mute();
    }

    /**
     * Get next track ID (loop to first when at end)
     */
    getNextTrackId(currentId) {
        const idx = this.trackList.findIndex(t => t.id === currentId);
        const nextIdx = (idx + 1) % this.trackList.length;
        return this.trackList[nextIdx].id;
    }

    /**
     * Play specific track
     */
    async playTrack(trackId) {
        // Stop current track
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }

        // Find and play new track
        const audio = this.tracks[trackId];
        if (!audio) {
            console.warn(`❌ Track not found: ${trackId}`);
            return;
        }

        try {
            this.currentTrack = audio;
            this.currentTrack.volume = this.volume;
            await this.currentTrack.play();
            
            this.isPlaying = true;
            this.preferences.currentTrackId = trackId;
            this.updateButtonState();
            this.updateTrackDisplay();
            this.savePreferences();
            
            const track = this.trackList.find(t => t.id === trackId);
            console.log(`🎵 Now playing: ${track?.name || trackId}`);
            
        } catch (error) {
            console.warn('⚠️ Failed to play track:', error);
            if (!this._countdownPlayStarted) {
                this.handleAudioError();
            }
        }
    }

    /**
     * Switch to different track
     */
    async switchTrack(trackId) {
        const wasPlaying = this.isPlaying;
        
        await this.playTrack(trackId);
        
        if (!wasPlaying) {
            this.mute();
        }

        this.updateTrackDisplay();
    }

    /**
     * Toggle track dropdown visibility
     */
    toggleTrackDropdown() {
        const trackSelector = document.getElementById('track-selector');
        const trackDropdown = document.getElementById('track-dropdown');
        
        if (!trackSelector || !trackDropdown) return;
        
        const isOpen = trackSelector.classList.contains('open');
        
        if (isOpen) {
            this.closeTrackDropdown();
        } else {
            this.openTrackDropdown();
        }
    }

    /**
     * Open track dropdown
     */
    openTrackDropdown() {
        const trackSelector = document.getElementById('track-selector');
        const trackDropdown = document.getElementById('track-dropdown');
        
        if (!trackSelector || !trackDropdown) return;
        
        trackSelector.classList.add('open');
        trackDropdown.style.display = 'block';
        
        // Update selected option
        const options = trackDropdown.querySelectorAll('.track-option');
        options.forEach(option => {
            option.classList.toggle('selected', option.dataset.value === this.preferences.currentTrackId);
        });
    }

    /**
     * Close track dropdown
     */
    closeTrackDropdown() {
        const trackSelector = document.getElementById('track-selector');
        const trackDropdown = document.getElementById('track-dropdown');
        
        if (!trackSelector || !trackDropdown) return;
        
        trackSelector.classList.remove('open');
        trackDropdown.style.display = 'none';
    }

    /**
     * Select track from dropdown
     */
    async selectTrack(trackId) {
        await this.switchTrack(trackId);
        this.closeTrackDropdown();
        
        // Play gentle click sound
        this.playSFX('button-click', 0.5);
    }

    /**
     * Initialize volume slider UI on page load
     */
    initVolumeSlider() {
        const slider = document.getElementById('volume-slider');
        const label = document.getElementById('volume-label');
        if (!slider || !label) return;

        const pct = Math.round(this.volume * 100);
        slider.value = pct;
        label.textContent = `${pct}%`;

        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.setVolume(val / 100);
            label.textContent = `${val}%`;
        });

        // Prevent slider interaction from triggering mute toggle
        slider.addEventListener('click', (e) => e.stopPropagation());
    }

    /**
     * Update track display name
     */
    updateTrackDisplay() {
        const trackName = document.getElementById('track-name');
        if (!trackName) return;
        
        const track = this.trackList.find(t => t.id === this.preferences.currentTrackId);
        if (track) {
            trackName.textContent = track.displayName;
        }
    }

    /**
     * Play sound effect
     */
    playSFX(sfxId, volume = 1.0) {
        if (this.isMobile()) return; // No SFX on mobile
        const audio = this.soundEffects[sfxId];
        if (!audio) {
            console.warn(`❌ SFX not found: ${sfxId}`);
            return;
        }

        try {
            // Clone audio for overlapping sounds
            const sfxClone = audio.cloneNode();
            sfxClone.volume = this.volume * 0.7 * volume;
            sfxClone.currentTime = 0;
            sfxClone.play();
        } catch (error) {
            console.warn(`⚠️ Failed to play SFX: ${sfxId}`, error);
        }
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update current track volume
        if (this.currentTrack) {
            this.currentTrack.volume = this.volume;
        }
        
        // Update all track volumes
        Object.values(this.tracks).forEach(audio => {
            audio.volume = this.volume;
        });
        
        // Update SFX volumes
        Object.values(this.soundEffects).forEach(audio => {
            audio.volume = this.volume * 0.7;
        });
        
        this.preferences.volume = this.volume;
        this.savePreferences();
        
        // Sync slider UI if updated programmatically
        const slider = document.getElementById('volume-slider');
        const label = document.getElementById('volume-label');
        const pct = Math.round(this.volume * 100);
        if (slider) slider.value = pct;
        if (label) label.textContent = `${pct}%`;
        
        console.log(`🔊 Volume set to: ${pct}%`);
    }

    /**
     * Update button visual state
     */
    updateButtonState() {
        const audioControl = document.getElementById('audio-control');
        const audioText = audioControl?.querySelector('.audio-text');
        if (!audioControl) return;

        if (this.isPlaying) {
            audioControl.classList.remove('muted');
            audioControl.setAttribute('aria-label', 'Pause background music');
            if (audioText) audioText.textContent = 'music';
        } else {
            audioControl.classList.add('muted');
            audioControl.setAttribute('aria-label', 'Play background music');
            if (audioText) audioText.textContent = 'play music';
        }
    }

    /**
     * Handle audio errors gracefully
     */
    handleAudioError() {
        const audioControl = document.getElementById('audio-control');
        if (audioControl) {
            audioControl.style.opacity = '0.5';
            audioControl.style.pointerEvents = 'none';
            
            // Show error message briefly
            const audioText = audioControl.querySelector('.audio-text');
            if (audioText) {
                const originalText = audioText.textContent;
                audioText.textContent = 'unavailable';
                setTimeout(() => {
                    audioText.textContent = originalText;
                    audioControl.style.opacity = '1';
                    audioControl.style.pointerEvents = 'auto';
                }, 2000);
            }
        }
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        localStorage.setItem('audioEnabled', this.preferences.enabled.toString());
        localStorage.setItem('currentTrack', this.preferences.currentTrackId);
        localStorage.setItem('audioVolume', this.preferences.volume.toString());
    }

    /**
     * Gọi từ queueMicrotask trong guest submit - chạy ngay sau click để giữ user gesture
     */
    async startMusicForCountdownFromGesture() {
        if (this.isMobile()) return;
        try {
            if (!this.isInitialized) await this.init();
            this.setVolume(0);
            this.preferences.enabled = true;
            await this.playTrack(this.preferences.currentTrackId);
            this._countdownPlayStarted = true;
        } catch (e) {
            console.warn('Could not pre-start music:', e);
            this._countdownPlayStarted = false;
        }
    }

    /**
     * Sau khi guest nhập tên: hiển thị đếm ngược 5s, sau đó tăng volume lên 10%
     * Nhạc đã được start bởi startMusicForCountdownFromGesture (chạy trong microtask)
     * Có nút Mute để hủy
     */
    async scheduleMusicAfterGuestReady() {
        if (this.isMobile()) return;

        const toast = document.getElementById('notification-toast');
        if (!toast) return;

        this._countdownPlayStarted = false;

        // Đợi microtask chạy xong (startMusicForCountdownFromGesture)
        await new Promise(r => setTimeout(r, 500));

        let cancelled = false;

        const renderContent = (num) => {
            const label = num === 1 ? 'second' : 'seconds';
            return `Music will start in  <span class="toast-countdown"> ${num} </span> ${label}... <button type="button" class="toast-mute-btn">Mute</button>`;
        };

        const hideToast = () => {
            toast.classList.remove('show');
            toast.textContent = '';
        };

        toast.classList.remove('show');
        toast.classList.remove('notification-toast-error');
        toast.innerHTML = renderContent(5);
        toast.querySelector('.toast-mute-btn').addEventListener('click', () => {
            cancelled = true;
            this.mute();
            if (window.localStorage) localStorage.setItem('audioEnabled', 'false');
            hideToast();
        });

        toast.offsetHeight;
        requestAnimationFrame(() => toast.classList.add('show'));

        for (let i = 4; i >= 1; i--) {
            await new Promise(r => setTimeout(r, 1000));
            if (cancelled) return;
            toast.innerHTML = renderContent(i);
            toast.querySelector('.toast-mute-btn').addEventListener('click', () => {
                cancelled = true;
                this.mute();
                if (window.localStorage) localStorage.setItem('audioEnabled', 'false');
                hideToast();
            });
        }

        await new Promise(r => setTimeout(r, 1000));
        if (cancelled) return;
        hideToast();

        if (this._countdownPlayStarted) {
            this.setVolume(0.1);
        } else {
            try {
                if (!this.isInitialized) await this.init();
                this.setVolume(0.1);
                this.preferences.enabled = true;
                await this.playTrack(this.preferences.currentTrackId);
            } catch (e) {
                console.warn('Could not start music:', e);
            }
        }
    }

    /**
     * Bind global events
     */
    bind() {
        // Initialize audio on first user interaction
        const initOnFirstClick = async () => {
            if (!this.isInitialized) {
                await this.init();
            }
            document.removeEventListener('click', initOnFirstClick, { capture: true });
        };
        
        document.addEventListener('click', initOnFirstClick, { capture: true, once: true });

        // Giữ nhạc phát liên tục khi chuyển tab (không pause khi tab ẩn)

        // Khi user nhập tên xong: thông báo đếm ngược 5s, sau đó mở nhạc ở 10%
        window.addEventListener('guestNameReady', () => {
            this.scheduleMusicAfterGuestReady();
        });

        // Respect user's reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.preferences.enabled = false;
        }
    }
}

// Global Audio Manager instance
window.audioManager = new AudioManager();

// Global helper functions for easy access
window.playSFX = (sfxId, volume = 1.0) => {
    window.audioManager.playSFX(sfxId, volume);
};

console.log('🎵 Audio Manager loaded');