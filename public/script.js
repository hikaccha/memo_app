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
const noteDetailDate = document.getElementById('note-detail-date');
const editNoteButton = document.getElementById('edit-note-button');
const deleteNoteButton = document.getElementById('delete-note-button');

let token = localStorage.getItem('token');
let currentNoteId = null;
let currentNote = null;

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

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const setDateInputs = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    document.getElementById('month').value = date.getMonth() + 1;
    document.getElementById('day').value = date.getDate();
};

const showNoteForm = (type, note = null) => {
    noteFormForm.dataset.type = type;
    if (type === 'edit' && note) {
        noteForm.querySelector('h2').textContent = 'メモ編集';
        noteFormForm.querySelector('button').textContent = '更新';
        document.getElementById('title').value = note.title;
        document.getElementById('content').value = note.content;
        
        // 日付の設定
        if (note.note_date) {
            setDateInputs(note.note_date);
        } else {
            setDateInputs();
        }
        
        currentNote = note;
    } else {
        noteForm.querySelector('h2').textContent = 'メモ作成';
        noteFormForm.querySelector('button').textContent = '作成';
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        setDateInputs();
        currentNote = null;
    }
    noteForm.style.display = 'block';
};

const showNoteDetail = (note) => {
    noteDetailTitle.textContent = note.title;
    noteDetailContent.textContent = note.content;
    
    // 日付の表示
    noteDetailDate.textContent = note.note_date ? formatDate(note.note_date) : '';
    
    noteDetail.style.display = 'block';
};

const displayNotes = (notes) => {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const li = document.createElement('li');
        const dateString = note.note_date ? formatDate(note.note_date) : '';
        
        li.innerHTML = `
            <strong>${note.title}</strong>
            ${dateString ? `<span class="note-date"> (${dateString})</span>` : ''}
        `;
        
        li.addEventListener('click', () => {
            showNoteDetail(note);
            currentNoteId = note.id;
            currentNote = note;
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
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    
    try {
        if (type === 'create') {
            await apiRequest('/notes', 'POST', { title, content, month, day });
        } else {
            await apiRequest(`/notes/${currentNoteId}`, 'PUT', { title, content, month, day });
        }
        noteForm.style.display = 'none';
        noteFormForm.reset();
        fetchNotes();
    } catch (error) {
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
    showNoteForm('edit', currentNote);
});

// 新規メモ作成ボタンの追加
const createNoteButton = document.createElement('button');
createNoteButton.textContent = '新規メモ作成';
createNoteButton.id = 'create-note-button';
createNoteButton.addEventListener('click', () => {
    resetNoteForm();
    showNoteForm('create');
});
noteList.prepend(createNoteButton);

// 登録・ログイン時のフォームリセット
const resetAuthForm = () => {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
};

// メモフォームのリセットする関数追加
const resetNoteForm = () => {
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
    noteFormForm.reset();
    setDateInputs();
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

// 日付入力の検証
const monthInput = document.getElementById('month');
const dayInput = document.getElementById('day');

monthInput.addEventListener('change', () => {
    const monthVal = parseInt(monthInput.value, 10);
    if (monthVal < 1) monthInput.value = 1;
    if (monthVal > 12) monthInput.value = 12;
    updateDayMaxValue();
});

dayInput.addEventListener('change', () => {
    updateDayMaxValue();
    const dayVal = parseInt(dayInput.value, 10);
    const maxDay = parseInt(dayInput.max, 10);
    if (dayVal < 1) dayInput.value = 1;
    if (dayVal > maxDay) dayInput.value = maxDay;
});

const updateDayMaxValue = () => {
    const monthVal = parseInt(monthInput.value, 10) || 1;
    const date = new Date();
    const year = date.getFullYear();
    const daysInMonth = new Date(year, monthVal, 0).getDate();
    dayInput.max = daysInMonth;
    
    // 現在の日が新しい月の最大日数より大きい場合は調整
    if (parseInt(dayInput.value, 10) > daysInMonth) {
        dayInput.value = daysInMonth;
    }
};

//初期化する
updateAuthStatus();

