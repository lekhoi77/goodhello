/**
 * User Loader - Dynamic data loading based on subdomain
 * Detects current user from subdomain and loads their data
 */

class UserLoader {
  constructor() {
    this.currentUser = null;
    this.userData = null;
    this.allUsersData = null;
  }

  /**
   * Detect username from subdomain
   * Examples:
   * - phatla.goodhello.com -> 'phatla'
   * - localhost -> 'phatla' (default)
   * - goodhello.com -> 'phatla' (default)
   */
  detectUser() {
    const hostname = window.location.hostname;
    
    // Check for URL parameter first (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    if (userParam) {
      return userParam;
    }

    // For localhost or main domain, default to 'phatla'
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'goodhello.space') {
      return 'phatla';
    }

    // Extract subdomain
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0]; // First part is the subdomain
    }

    // Fallback
    return 'phatla';
  }

  /**
   * Load users data from JSON file
   */
  async loadUsersData() {
    try {
      const response = await fetch('asset/data/users-data.json');
      if (!response.ok) {
        throw new Error(`Failed to load users data: ${response.status}`);
      }
      this.allUsersData = await response.json();
      return this.allUsersData;
    } catch (error) {
      console.error('Error loading users data:', error);
      throw error;
    }
  }

  /**
   * Get data for specific user
   */
  getUserData(username) {
    if (!this.allUsersData) {
      console.error('Users data not loaded yet');
      return null;
    }

    const userData = this.allUsersData[username];
    if (!userData) {
      console.error(`User '${username}' not found in data`);
      return null;
    }

    return userData;
  }

  /**
   * Initialize the loader
   */
  async init() {
    try {
      // Detect current user
      this.currentUser = this.detectUser();
      console.log('Current user:', this.currentUser);

      // Load all users data
      await this.loadUsersData();

      // Get current user's data
      this.userData = this.getUserData(this.currentUser);

      if (!this.userData) {
        throw new Error(`Failed to load data for user: ${this.currentUser}`);
      }

      return this.userData;
    } catch (error) {
      console.error('Failed to initialize user loader:', error);
      // Fallback to default data structure
      return this.getDefaultData();
    }
  }

  /**
   * Fallback default data in case of errors
   */
  getDefaultData() {
    return {
      mainTitle: "A 3-year<br>journey",
      stamps: [],
      details: null
    };
  }

  /**
   * Render stamps dynamically
   */
  renderStamps(container) {
    if (!this.userData || !this.userData.stamps) {
      console.error('No stamp data to render');
      return;
    }

    // Clear existing stamps
    container.innerHTML = '';

    // Create stamp elements
    this.userData.stamps.forEach((stamp, index) => {
      const img = document.createElement('img');
      img.src = stamp.src;
      img.alt = stamp.alt;
      img.dataset.title = stamp.title;
      img.dataset.tooltip = 'View story';
      img.className = 'stamp-item';
      container.appendChild(img);
    });

    return Array.from(container.querySelectorAll('.stamp-item'));
  }

  /**
   * Update main title
   */
  updateMainTitle(titleElement) {
    if (!this.userData || !this.userData.mainTitle) {
      console.error('No title data');
      return;
    }

    titleElement.innerHTML = this.userData.mainTitle;
  }

  /**
   * Render stamp details sections
   */
  renderStampDetails(container) {
    if (!this.userData || !this.userData.stamps) {
      console.error('No stamp data to render details');
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create a detail section for each stamp
    this.userData.stamps.forEach((stamp, index) => {
      const section = document.createElement('section');
      section.className = 'stamp-detail-section';
      section.dataset.stampIndex = index;

      // Get description from stamp or use placeholder
      const description = stamp.description || `Lorem ipsum dolor sit amet consectetur. Lectus sed quam diam gravida aenean sit varius integer. Cras vel vitae et orci adipiscing rutrum nec. Posuere sed donec risus sit ligula. Turpis ultrices mauris morbi quisque. Massa sit dolor placerat velit. Elementum sapien aliquet massa amet habitant nunc. pus.`;

      section.innerHTML = `
        <button class="back-to-stamps" onclick="window.stampDetailsController.hideAllDetails()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Stamp list (esc)
        </button>

        <div class="stamp-detail-image">
          <img src="${stamp.src}" alt="${stamp.alt}">
        </div>

        <div class="stamp-detail-content">
          <h2 class="stamp-detail-title heading-2">${stamp.title}</h2>
          <p class="stamp-detail-description">${description}</p>
          <button class="btn-icon btn-icon-sm favorite-button" data-stamp-index="${index}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
              <path d="M9.19743 1.28598C14.3112 -3.42097 26.2497 5.47686 9.00017 16.8748C-8.24949 5.47688 3.68811 -3.42075 8.80192 1.28598C8.86901 1.34773 8.93551 1.41191 9.00017 1.47836C9.06477 1.41196 9.1304 1.34769 9.19743 1.28598ZM16.425 3.43442C15.172 0.987378 11.7007 0.31487 9.80583 2.26254L9.00017 3.09164L8.19353 2.26254C6.29863 0.314925 2.82836 0.987397 1.57536 3.43442C0.986094 4.58528 0.853918 6.24633 1.92888 8.36704C2.96421 10.4095 5.11635 12.8543 9.00017 15.5184C12.8838 12.8543 15.0362 10.4095 16.0715 8.36704C17.1463 6.24652 17.0141 4.58525 16.425 3.43442Z" fill="#2A2A2A"/>
            </svg>
            <span class="body-md">Choose as your Favorite</span>
          </button>
        </div>
      `;

      container.appendChild(section);
    });

    return container.querySelectorAll('.stamp-detail-section');
  }

  /**
   * Get favorite stamp from localStorage
   */
  getFavoriteStamp() {
    const key = `favorite_stamp_${this.currentUser}`;
    return localStorage.getItem(key);
  }

  /**
   * Set favorite stamp in localStorage
   */
  setFavoriteStamp(stampIndex) {
    const key = `favorite_stamp_${this.currentUser}`;
    localStorage.setItem(key, stampIndex);
  }
}

// Stamp Details Controller
class StampDetailsController {
  constructor() {
    this.container = null;
    this.stampsSection = null;
    this.detailSections = [];
  }

  init(container, stampsSection) {
    this.container = container;
    this.stampsSection = stampsSection;
    this.nav = document.querySelector('nav');
    
    // Render all detail sections
    this.detailSections = window.userLoader.renderStampDetails(container);

    // Setup favorite buttons
    this.setupFavoriteButtons();

    // Load saved favorite
    this.loadFavoriteState();

    // Setup global ESC key handler to close overlay
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        if (this.container && this.container.style.display === 'block') {
          this.hideAllDetails();
        }
      }
    });
  }

  showDetail(stampIndex) {
    // Disable smooth scroll
    if (window.lenis) {
      window.lenis.stop();
    }

    // Hide nav immediately
    if (this.nav) {
      this.nav.style.display = 'none';
    }

    // Add fading class to stamps section
    if (this.stampsSection) {
      this.stampsSection.classList.add('fading-out');
    }

    // Wait for fade animation to complete before showing overlay
    setTimeout(() => {
      // Show container
      this.container.style.display = 'block';

      // Hide all sections first
      this.detailSections.forEach(section => {
        section.style.display = 'none';
      });

      // Show the selected section
      if (this.detailSections[stampIndex]) {
        this.detailSections[stampIndex].style.display = 'flex';
        
        // Scroll to top of the details container
        this.container.scrollTop = 0;

        // Auto-show favourite button hint after delay
        const favoriteButton = this.detailSections[stampIndex].querySelector('.favorite-button');
        if (favoriteButton) {
          // Wait 1 second before showing hint
          setTimeout(() => {
            // Add hint class to trigger auto-hover effect (stays permanently)
            favoriteButton.classList.add('show-hint');
          }, 1000);
        }
      }
    }, 400); // Match CSS transition duration
  }

  hideAllDetails() {
    // Re-enable smooth scroll
    if (window.lenis) {
      window.lenis.start();
    }

    // Hide container
    this.container.style.display = 'none';

    // Show nav again
    if (this.nav) {
      this.nav.style.display = 'flex';
    }

    // Remove fading class from stamps section
    if (this.stampsSection) {
      this.stampsSection.classList.remove('fading-out');
    }
  }

  setupFavoriteButtons() {
    const buttons = this.container.querySelectorAll('.favorite-button');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const stampIndex = e.currentTarget.dataset.stampIndex;
        this.toggleFavorite(stampIndex, e.currentTarget);
      });
    });
  }

  toggleFavorite(stampIndex, buttonElement) {
    const currentFavorite = window.userLoader.getFavoriteStamp();
    
    if (currentFavorite === stampIndex) {
      // Remove favorite
      window.userLoader.setFavoriteStamp(null);
      buttonElement.classList.remove('active');
      buttonElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
          <path d="M9.19743 1.28598C14.3112 -3.42097 26.2497 5.47686 9.00017 16.8748C-8.24949 5.47688 3.68811 -3.42075 8.80192 1.28598C8.86901 1.34773 8.93551 1.41191 9.00017 1.47836C9.06477 1.41196 9.1304 1.34769 9.19743 1.28598ZM16.425 3.43442C15.172 0.987378 11.7007 0.31487 9.80583 2.26254L9.00017 3.09164L8.19353 2.26254C6.29863 0.314925 2.82836 0.987397 1.57536 3.43442C0.986094 4.58528 0.853918 6.24633 1.92888 8.36704C2.96421 10.4095 5.11635 12.8543 9.00017 15.5184C12.8838 12.8543 15.0362 10.4095 16.0715 8.36704C17.1463 6.24652 17.0141 4.58525 16.425 3.43442Z" fill="#2A2A2A"/>
        </svg>
        <span class="body-md">Choose as your Favorite</span>
      `;
    } else {
      // Set new favorite
      window.userLoader.setFavoriteStamp(stampIndex);
      
      // Remove active class from all buttons
      const allButtons = this.container.querySelectorAll('.favorite-button');
      allButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
            <path d="M9.19743 1.28598C14.3112 -3.42097 26.2497 5.47686 9.00017 16.8748C-8.24949 5.47688 3.68811 -3.42075 8.80192 1.28598C8.86901 1.34773 8.93551 1.41191 9.00017 1.47836C9.06477 1.41196 9.1304 1.34769 9.19743 1.28598ZM16.425 3.43442C15.172 0.987378 11.7007 0.31487 9.80583 2.26254L9.00017 3.09164L8.19353 2.26254C6.29863 0.314925 2.82836 0.987397 1.57536 3.43442C0.986094 4.58528 0.853918 6.24633 1.92888 8.36704C2.96421 10.4095 5.11635 12.8543 9.00017 15.5184C12.8838 12.8543 15.0362 10.4095 16.0715 8.36704C17.1463 6.24652 17.0141 4.58525 16.425 3.43442Z" fill="#2A2A2A"/>
          </svg>
          <span class="body-md">Choose as your Favorite</span>
        `;
      });

      // Add active class to clicked button
      buttonElement.classList.add('active');
      buttonElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
          <path d="M9 1.47828C13.9931 -3.65395 26.4758 5.32726 9 16.8748C-8.47605 5.32721 4.00684 -3.65397 9 1.47828Z" fill="#0038BC"/>
        </svg>
        <span class="body-md">Your Favorite</span>
      `;
      
      // Show notification toast
      this.showNotification();
      
      // Dispatch custom event for invitation card to update
      window.dispatchEvent(new CustomEvent('favoriteStampChanged', { 
        detail: { stampIndex } 
      }));
    }
  }

  showNotification() {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    
    toast.textContent = 'This stamp gonna be used in your invitation later :>';
    
    // Play notification sound
    if (window.playSFX) {
      window.playSFX('notification', 0.6);
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

  loadFavoriteState() {
    const favoriteIndex = window.userLoader.getFavoriteStamp();
    if (favoriteIndex !== null) {
      const buttons = this.container.querySelectorAll('.favorite-button');
      buttons.forEach(button => {
        if (button.dataset.stampIndex === favoriteIndex) {
          button.classList.add('active');
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
              <path d="M9 1.47828C13.9931 -3.65395 26.4758 5.32726 9 16.8748C-8.47605 5.32721 4.00684 -3.65397 9 1.47828Z" fill="#0038BC"/>
            </svg>
            <span class="body-md">Your Favorite</span>
          `;
        }
      });
    }
  }
}

// Create global instance
window.userLoader = new UserLoader();

// Create global stamp details controller
window.stampDetailsController = new StampDetailsController();
