const app = document.getElementById('app');
const authButtons = document.getElementById('auth-buttons');
const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const authForm = document.getElementById('auth-form');
const authFormTitle = document.querySelector('#auth-form h2');
const authFormForm = document.getElementById('auth-form-form');
const noteForm = document.getElementById('note-form');
const noteFormForm = document.getElementById('note-form-form');
const noteList = document.getElementById('note-list');
const notesList = document.getElementById('notes');
const noteDetail = document.getElementById('note-detail');
const noteDetailTitle = document.getElementById('note-detail-title');
const noteDetailContent = document.getElementById('note-detail-content');
const editNoteButton = document.getElementById('edit-note-button');
const deleteNoteButton = document.getElementById('delete-note-button');

let token = localStorage.getItem('token');
let currentNoteId = null;

const updateAuthStatus = () => {
    if (token) {
        registerButton.style.display = 'none';
        loginButton.style.display = 'none';
        logoutButton.style.display =  'block';
        noteList.style.display = 'block';
        fetchNotes();
    } else {
        registerButton.style.display = 'block';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        noteList.style.display = 'none';
        noteForm.style.display = 'none';
        noteDetail.style.display = 'none';
    }
};

const showAuthForm = (type) => {
    authFormTitle.textContent = type === 'register' ? 'ユーザー登録' : 'ログイン';
    authFormForm.querySelector('button').textContent = type === 'register' ? '登録' : 'ログイン';
    authFormForm.dataset.type = type;
    authForm.style.display = 'block';
};

const showNoteForm = (type, note = null) => {
    noteFormForm.dataset.type = type;
    if (type === 'edit' && note) {
        noteForm.querySelector('h2').textContent = 'メモ編集';
        noteFormForm.querySelector('button').textContent = '更新';
        document.getElementById('title').value = note.title;
        document.getElementById('content').value = note.content;
    } else {
        noteForm.querySelector('h2').textContent = 'メモ作成';
        noteFormForm.querySelector('button').textContent = '作成';
        document.getElementById('title').value = '';　　　//ここらへんで次回以降新規メモ作成する時にフォームが空になるようにしている
        document.getElementById('content').value = '';
    }
    noteForm.style.display = 'block';
};

const showNoteDetail = (note) => {
    noteDetailTitle.textContent = note.title;
    noteDetailContent.textContent = note.content;
    noteDetail.style.display = 'block';
};

const displayNotes = (notes) => {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note.title;
        li.addEventListener('click', () => {
            showNoteDetail(note);
            currentNoteId = note.id;
        });
        notesList.appendChild(li);
    });
};

const displayError = (message) => {
    alert(message);
};

const apiRequest = async (url, method, body = null) => {
    const baseUrl = 'http://localhost:3000'; // APIサーバーのベースURL
    const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
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
        
        // 204 No Content の場合は空オブジェクトを返す（JSONパースをスキップ）
        if (response.status === 204) {
            return {};
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

authFormForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = authFormForm.dataset.type;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log(`Attempting ${type} with username: ${username}`);
    
    try {
        console.log(`Sending request to: /users/${type}`);
        const data = await apiRequest(`/users/${type}`, 'POST', { username, password });
        console.log('Response:', data);
        
        if (type === 'login') {
            token = data.token;
            localStorage.setItem('token', token);
            console.log('Token saved:', token);
            authForm.style.display = 'none';
            updateAuthStatus();
        } else {
            alert('登録しました。ログインしてください。');
            authForm.style.display = 'none';
            showAuthForm('login');
        }
    } catch (error) {
        console.error('Auth error:', error);
        displayError(error.message);
    }
});

noteFormForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = noteFormForm.dataset.type;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    try {
        if (type === 'create') {
            await apiRequest('/notes', 'POST', { title, content });
        } else {
            await apiRequest(`/notes/${currentNoteId}`, 'PUT', { title, content });
        }
        noteForm.style.display = 'none';
        noteFormForm.reset();
        fetchNotes();
    } catch  (error) {
        displayError(error.message);
    }
});

deleteNoteButton.addEventListener('click', async () => {
    if (!confirm('削除しますか？')) return;
    try {
        await apiRequest(`/notes/${currentNoteId}`, 'DELETE');
        noteDetail.style.display = 'none';
        fetchNotes();
    } catch (error) {
        displayError(error.message);
    }
});

const fetchNotes = async () => {
    try {
        const notes = await apiRequest('/notes', 'GET');
        displayNotes(notes);
    } catch (error) {
        displayError(error.message);
    }
};

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    updateAuthStatus();
});

registerButton.addEventListener('click', () => {
    showAuthForm('register');
    resetAuthForm();
});
loginButton.addEventListener('click', () => {
    showAuthForm('login');
    resetAuthForm();
});

editNoteButton.addEventListener('click', () => {
    const title = document.getElementById('note-detail-title').textContent;
    const content = document.getElementById('note-detail-content').textContent;
    showNoteForm('edit', { title, content });
});

// 新規メモ作成ボタンの追加
const createNoteButton = document.createElement('button');
createNoteButton.textContent = '新規メモ作成';
createNoteButton.id = 'create-note-button';
createNoteButton.addEventListener('click', () => {
    resetNoteForm();     // いちいち消さなくていいようにメモフォームのリセットを追加した
    showNoteForm('create');
});
noteList.prepend(createNoteButton);

// 登録・ログイン時のフォームリセット
const resetAuthForm = () => {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
};

// メモフォームのリセットする関数追加→キャンセルボタンいもぶち込んだ
const resetNoteForm = () => {
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    noteFormForm.reset();
};

// authFormのキャンセルボタン追加
const cancelAuthButton = document.createElement('button');
cancelAuthButton.textContent = 'キャンセル';
cancelAuthButton.type = 'button';
cancelAuthButton.addEventListener('click', () => {
    authForm.style.display = 'none';
    resetAuthForm();
});
authFormForm.appendChild(cancelAuthButton);

// noteFormのキャンセルボタン追加
const cancelNoteButton = document.createElement('button');
cancelNoteButton.textContent = 'キャンセル';
cancelNoteButton.type = 'button';
cancelNoteButton.addEventListener('click', () => {
    noteForm.style.display = 'none';
    resetNoteForm();
});
noteFormForm.appendChild(cancelNoteButton);

//初期化する
updateAuthStatus();

