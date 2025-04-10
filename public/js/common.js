// Common functionality for the MPA version of Ownlender

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const clearToken = () => localStorage.removeItem('token');
const isAuthenticated = () => !!getToken();

// Redirect if not authenticated
const requireAuth = () => {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
};

// Redirect if already authenticated
const requireNoAuth = () => {
    if (isAuthenticated()) {
        window.location.href = '/notes.html';
        return false;
    }
    return true;
};

// Common API request function
const apiRequest = async (url, method, body = null) => {
    const baseUrl = 'http://localhost:3000'; // API server base URL
    const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = { 
        method, 
        headers,
        credentials: 'include',
        mode: 'cors'
    };
    
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(baseUrl + url, options);
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            console.log('Authentication error: Clearing token');
            clearToken();
            window.location.href = '/login.html';
            throw new Error('Authentication failed. Please login again.');
        }
        
        // Return empty object for 204 No Content responses
        if (response.status === 204) {
            return {};
        }
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Invalid server response: ${await response.text()}`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API Error');   
        }
        
        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};

// Display error function
const displayError = (message) => {
    showCustomAlert(message);
};

// Custom alert function
const showCustomAlert = (message) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    // Create alert container
    const alert = document.createElement('div');
    alert.className = 'custom-alert';
    
    // Add message
    const messageElem = document.createElement('div');
    messageElem.className = 'custom-alert-message';
    messageElem.textContent = message;
    alert.appendChild(messageElem);
    
    // Add OK button
    const button = document.createElement('button');
    button.className = 'custom-alert-button';
    button.textContent = 'OK';
    button.onclick = () => {
        document.body.removeChild(overlay);
    };
    alert.appendChild(button);
    
    // Add alert to overlay and overlay to body
    overlay.appendChild(alert);
    document.body.appendChild(overlay);
    
    // Focus the button
    button.focus();
};

// Custom confirm function
const showCustomConfirm = (message) => {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        // Create alert container
        const alert = document.createElement('div');
        alert.className = 'custom-alert';
        
        // Add message
        const messageElem = document.createElement('div');
        messageElem.className = 'custom-alert-message';
        messageElem.textContent = message;
        alert.appendChild(messageElem);
        
        // Add buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '10px';
        
        // Add OK button
        const okButton = document.createElement('button');
        okButton.className = 'custom-alert-button';
        okButton.textContent = 'OK';
        okButton.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        buttonContainer.appendChild(okButton);
        
        // Add Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.className = 'custom-alert-button';
        cancelButton.style.backgroundColor = '#f44336';
        cancelButton.textContent = 'キャンセル';
        cancelButton.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        buttonContainer.appendChild(cancelButton);
        
        alert.appendChild(buttonContainer);
        
        // Add alert to overlay and overlay to body
        overlay.appendChild(alert);
        document.body.appendChild(overlay);
        
        // Focus the OK button
        okButton.focus();
    });
};

// Date formatting 
const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Check if this is a month-day only format (m-d)
    if (dateString.match(/^\d{1,2}-\d{1,2}$/)) {
        const [month, day] = dateString.split('-');
        return `${month}月${day}日`;
    }
    
    // Otherwise format as month and day only from full date
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// Function to handle month and day inputs
const setupMonthDayInputs = () => {
    const monthInputs = document.querySelectorAll('.month-input');
    const dayInputs = document.querySelectorAll('.day-input');
    
    // Setup month inputs
    monthInputs.forEach(input => {
        // Only allow numbers
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Auto adjust values outside the range
            const val = parseInt(e.target.value);
            if (val > 12) e.target.value = '12';
            if (val < 1 && e.target.value !== '') e.target.value = '1';
        });
    });
    
    // Setup day inputs
    dayInputs.forEach(input => {
        // Only allow numbers
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Auto adjust values outside the range
            const val = parseInt(e.target.value);
            if (val > 31) e.target.value = '31';
            if (val < 1 && e.target.value !== '') e.target.value = '1';
        });
    });
    
    // Setup form submission preparation
    const noteForms = document.querySelectorAll('form[data-has-date="true"]');
    noteForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const monthInput = form.querySelector('.month-input');
            const dayInput = form.querySelector('.day-input');
            const dateInput = form.querySelector('.note-date-hidden');
            
            if (monthInput && dayInput && dateInput) {
                const month = monthInput.value;
                const day = dayInput.value;
                
                if (month && day) {
                    dateInput.value = `${month}-${day}`;
                } else {
                    dateInput.value = '';
                }
            }
        });
    });
};

// Parse note date into month and day
const setMonthDayFromNoteDate = (noteDate, monthInput, dayInput) => {
    if (!noteDate || !monthInput || !dayInput) return;
    
    if (noteDate.match(/^\d{1,2}-\d{1,2}$/)) {
        const [month, day] = noteDate.split('-');
        monthInput.value = month;
        dayInput.value = day;
    }
};

// User icon with dropdown
const setupUserIcon = async () => {
    const userProfile = document.getElementById('user-profile');
    if (!userProfile) return;
    
    // 明示的にユーザープロファイルエリアを表示
    userProfile.style.display = 'block';
    
    const userIcon = document.getElementById('user-icon');
    if (!userIcon) {
        console.error('User icon element not found');
        return;
    }
    
    const iconSpan = userIcon.querySelector('span');
    if (!iconSpan) {
        console.error('User icon span element not found');
        return;
    }
    
    try {
        // Get user data to display first character
        const userData = await apiRequest('/user/profile', 'GET');
        const firstChar = userData && userData.username ? userData.username.charAt(0).toUpperCase() : 'U';
        iconSpan.textContent = firstChar;
    } catch (error) {
        iconSpan.textContent = 'U';
        console.error('Failed to load user profile:', error);
    }
    
    // Toggle dropdown menu when user icon is clicked
    userIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        userIcon.classList.toggle('active');
    });

    // Handle clicks outside the dropdown to close it
    document.addEventListener('click', (e) => {
        if (!userProfile.contains(e.target)) {
            userIcon.classList.remove('active');
        }
    });
    
    // Handle logout button in dropdown
    const logoutButton = document.getElementById('logout-dropdown-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                // Call logout API before clearing token
                await apiRequest('/auth/logout', 'POST');
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                clearToken();
                window.location.href = '/login.html';
            }
        });
    }
};

// Common header setup for authenticated pages
const setupAuthenticatedHeader = () => {
    if (!requireAuth()) return;
    
    setupUserIcon();
    
    // Setup navigation links for authenticated user
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <a href="/notes.html" class="button">日記一覧</a>
            <a href="/create-note.html" class="button">新規作成</a>
            <a href="/categories.html" class="button">カテゴリ管理</a>
        `;
    }
};

// Validate token on page load
const validateToken = async () => {
    if (!getToken()) return;
    
    try {
        // Send simple request to verify token
        await apiRequest('/notes', 'GET');
        console.log('Token validated successfully');
    } catch (error) {
        console.error('Token validation failed:', error);
        // Error handling is done in apiRequest
    }
};

// Initialize datepickers if they exist - deprecated, using month-day inputs instead
const initializeDatepickers = () => {
    // This function is kept for backwards compatibility
    // Use setupMonthDayInputs() instead
    setupMonthDayInputs();
};

// Document ready function
const documentReady = (callback) => {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

// Export common functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getToken,
        setToken,
        clearToken,
        isAuthenticated,
        requireAuth,
        requireNoAuth,
        apiRequest,
        displayError,
        showCustomAlert,
        showCustomConfirm,
        formatDate,
        setupUserIcon,
        setupAuthenticatedHeader,
        validateToken,
        initializeDatepickers,
        setupMonthDayInputs,
        setMonthDayFromNoteDate,
        documentReady
    };
} 