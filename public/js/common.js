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
    const baseUrl = 'http://localhost:3000'; // APIサーバーのベースURL
    const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = { 
        method, 
        headers,
        credentials: 'include', // CORSでCookieを送信する場合
        mode: 'cors'
    };
    
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(baseUrl + url, options);
        
        // 認証エラーの場合はトークンをクリアしてログインページにリダイレクト
        if (response.status === 401 || response.status === 403) {
            console.log('認証エラー: トークンをクリアします');
            clearToken();
            window.location.href = '/login.html';
            throw new Error('認証に失敗しました。再ログインしてください。');
        }
        
        // 204 No Content の場合は空オブジェクトを返す（JSONパースをスキップ）
        if (response.status === 204) {
            return {};
        }
        
        // レスポンスがJSONでない場合のエラーハンドリング
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`サーバーからの応答が不正です: ${await response.text()}`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'APIエラー');   
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
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// User icon with dropdown
const setupUserIcon = () => {
    const userProfile = document.getElementById('user-profile');
    if (!userProfile) return;
    
    userProfile.style.display = 'block';
    
    const userIcon = document.getElementById('user-icon');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    // Show first character of username in the user icon
    userIcon.querySelector('span').textContent = "U";
    
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
        logoutButton.addEventListener('click', () => {
            clearToken();
            window.location.href = '/login.html';
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
            <a href="/note-create.html" class="button">新規作成</a>
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
        console.log('トークン検証成功');
    } catch (error) {
        console.error('トークン検証失敗:', error);
        // Error handling is done in apiRequest
    }
}; 