// Splash Screen Handler
const splashScreen = document.getElementById('splash-screen');
const app = document.getElementById('app');

// Initially hide the app content
app.style.opacity = '0';
app.style.transition = 'opacity 0.5s ease';

// Handle splash screen display and hide app initially
document.addEventListener('DOMContentLoaded', () => {
    // Hide auth buttons initially until splash screen fades
    const authButtons = document.getElementById('auth-buttons');
    if (authButtons) {
        authButtons.style.visibility = 'hidden';
    }
    
    setTimeout(() => {
        // After splash animation is complete, show the app
        app.style.opacity = '1';
        
        // Make sure splash is hidden (in case animation failed)
        setTimeout(() => {
            splashScreen.style.display = 'none';
            
            // Show auth buttons after splash is gone
            if (authButtons) {
                authButtons.style.visibility = 'visible';
                authButtons.style.animation = 'fadeIn 0.5s ease-in-out forwards';
            }
        }, 2000);
    }, 3000); // Total time including delay: 1.5s + 2s = 3.5s
});

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
const noteDetailCategories = document.getElementById('note-detail-categories');
const editNoteButton = document.getElementById('edit-note-button');
const deleteNoteButton = document.getElementById('delete-note-button');
const categorySelect = document.getElementById('category-select');
const categoriesInput = document.getElementById('categories');
const categorySuggestions = document.getElementById('category-suggestions');
const categoryManagement = document.getElementById('category-management');
const addCategoryForm = document.getElementById('add-category-form');
const categoryList = document.getElementById('category-list');

let token = localStorage.getItem('token');
let currentNoteId = null;
let currentNote = null;
let allCategories = [];

const updateAuthStatus = () => {
    if (token) {
        registerButton.style.display = 'none';
        loginButton.style.display = 'none';
        logoutButton.style.display =  'block';
        noteList.style.display = 'block';
        fetchNotes();
        fetchCategories();
        
        // カテゴリ管理セクションの表示を追加
        const manageCategoriesButton = document.createElement('button');
        manageCategoriesButton.textContent = 'カテゴリ管理';
        manageCategoriesButton.id = 'manage-categories-button';
        manageCategoriesButton.addEventListener('click', () => {
            if (categoryManagement.style.display === 'none') {
                categoryManagement.style.display = 'block';
            } else {
                categoryManagement.style.display = 'none';
            }
        });
        
        // すでにボタンが存在している場合は追加しない
        if (!document.getElementById('manage-categories-button')) {
            noteList.insertBefore(manageCategoriesButton, noteList.firstChild);
        }
    } else {
        registerButton.style.display = 'block';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        noteList.style.display = 'none';
        noteForm.style.display = 'none';
        noteDetail.style.display = 'none';
        categoryManagement.style.display = 'none';
        
        // カテゴリ管理ボタンを削除
        const manageCategoriesButton = document.getElementById('manage-categories-button');
        if (manageCategoriesButton) {
            manageCategoriesButton.remove();
        }
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
        noteForm.querySelector('h2').textContent = '日記編集';
        noteFormForm.querySelector('button').textContent = '更新';
        document.getElementById('title').value = note.title;
        document.getElementById('content').value = note.content;
        
        // 日付の設定
        if (note.note_date) {
            setDateInputs(note.note_date);
        } else {
            setDateInputs();
        }
        
        // カテゴリの設定
        if (note.categories && Array.isArray(note.categories)) {
            document.getElementById('categories').value = note.categories.map(cat => cat.name).join(', ');
        } else {
            document.getElementById('categories').value = '';
        }
        
        currentNote = note;
    } else {
        noteForm.querySelector('h2').textContent = '日記作成';
        noteFormForm.querySelector('button').textContent = '作成';
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('categories').value = '';
        setDateInputs();
        currentNote = null;
    }
    noteForm.style.display = 'block';
    
    // スムーズスクロールを追加
    noteForm.scrollIntoView({ behavior: 'smooth' });
};

const showNoteDetail = (note) => {
    noteDetailTitle.textContent = note.title;
    noteDetailContent.textContent = note.content;
    
    // 日付の表示
    noteDetailDate.textContent = note.note_date ? formatDate(note.note_date) : '';
    
    // カテゴリの表示
    noteDetailCategories.innerHTML = '';
    if (note.categories && Array.isArray(note.categories) && note.categories.length > 0 && note.categories[0] !== null) {
        note.categories.forEach(category => {
            if (category && category.name) {
                const categoryTag = document.createElement('span');
                categoryTag.className = 'category-tag';
                categoryTag.textContent = category.name;
                noteDetailCategories.appendChild(categoryTag);
            }
        });
    } else {
        noteDetailCategories.innerHTML = '<em>カテゴリなし</em>';
    }
    
    noteDetail.style.display = 'block';
};

const displayNotes = (notes) => {
    notesList.innerHTML = '';
    
    if (!notes || !Array.isArray(notes)) {
        return;
    }
    
    notes.forEach(note => {
        const li = document.createElement('li');
        const dateString = note.note_date ? formatDate(note.note_date) : '';
        
        // カテゴリタグを追加
        let categoryHTML = '';
        if (note.categories && Array.isArray(note.categories) && note.categories.length > 0 && note.categories[0] !== null) {
            categoryHTML = '<div class="note-categories">';
            note.categories.forEach(category => {
                if (category && category.name) {
                    categoryHTML += `<span class="category-tag">${category.name}</span>`;
                }
            });
            categoryHTML += '</div>';
        }
        
        li.innerHTML = `
            <strong>${note.title}</strong>
            ${dateString ? `<span class="note-date"> (${dateString})</span>` : ''}
            ${categoryHTML}
        `;
        
        li.addEventListener('click', () => {
            showNoteDetail(note);
            currentNoteId = note.id;
            currentNote = note;
        });
        notesList.appendChild(li);
    });
};

// カテゴリのセレクトボックスを更新
const updateCategorySelect = (categories) => {
    // 現在の選択値を保存
    const currentValue = categorySelect.value;
    
    // セレクトボックスをクリア
    categorySelect.innerHTML = '<option value="">すべて表示</option>';
    
    // カテゴリを追加
    if (categories && Array.isArray(categories)) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // 可能であれば元の選択値を復元
    if (currentValue) {
        categorySelect.value = currentValue;
    }
};

// カテゴリ一覧を表示
const displayCategories = (categories) => {
    categoryList.innerHTML = '';
    
    if (!categories || !Array.isArray(categories)) {
        return;
    }
    
    categories.forEach(category => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <span>${category.name}</span>
            <span class="category-delete-btn" data-id="${category.id}">×</span>
        `;
        
        // 削除ボタンのイベントリスナー
        li.querySelector('.category-delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`カテゴリ「${category.name}」を削除しますか？`)) {
                try {
                    await apiRequest(`/categories/${category.id}`, 'DELETE');
                    fetchCategories();
                } catch (error) {
                    displayError(error.message);
                }
            }
        });
        
        categoryList.appendChild(li);
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
        
        // 認証エラーの場合はトークンをクリア
        if (response.status === 401 || response.status === 403) {
            console.log('認証エラー: トークンをクリアします');
            localStorage.removeItem('token');
            token = null;
            updateAuthStatus();
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
            // 認証エラーの場合の特別なハンドリング
            if (response.status === 401 || response.status === 403) {
                throw new Error('認証に失敗しました。再ログインしてください。');
            }
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
    const categoriesValue = document.getElementById('categories').value;
    
    // カテゴリをカンマで分割して前後の空白を削除
    const categories = categoriesValue.split(',')
        .map(cat => cat.trim())
        .filter(cat => cat !== '');
    
    try {
        if (type === 'create') {
            await apiRequest('/notes', 'POST', { title, content, month, day, categories });
        } else {
            await apiRequest(`/notes/${currentNoteId}`, 'PUT', { title, content, month, day, categories });
        }
        noteForm.style.display = 'none';
        noteFormForm.reset();
        fetchNotes();
        fetchCategories(); // カテゴリが新しく追加された可能性があるため再取得
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
        // カテゴリフィルターの値を取得
        const categoryId = categorySelect.value;
        
        // カテゴリIDがある場合はフィルターして取得
        const url = categoryId ? `/notes?category_id=${categoryId}` : '/notes';
        
        const notes = await apiRequest(url, 'GET');
        displayNotes(notes);
    } catch (error) {
        displayError(error.message);
    }
};

// カテゴリを取得する関数
const fetchCategories = async () => {
    try {
        const categories = await apiRequest('/categories', 'GET');
        allCategories = categories;
        updateCategorySelect(categories);
        displayCategories(categories);
    } catch (error) {
        console.error('カテゴリの取得に失敗しました:', error.message);
        // エラーが発生しても、アプリ全体の動作に影響しないように空の配列を設定
        allCategories = [];
        updateCategorySelect([]);
        displayCategories([]);
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

// カテゴリの選択が変更されたら日記一覧を再取得
categorySelect.addEventListener('change', () => {
    fetchNotes();
});

// カテゴリ入力フィールドの入力候補表示
categoriesInput.addEventListener('input', () => {
    const inputValue = categoriesInput.value;
    const lastCategory = inputValue.split(',').pop().trim();
    
    if (lastCategory.length > 0) {
        // 入力候補をフィルタリング
        const filteredCategories = allCategories.filter(cat => 
            cat.name.toLowerCase().includes(lastCategory.toLowerCase())
        );
        
        if (filteredCategories.length > 0) {
            categorySuggestions.innerHTML = '';
            filteredCategories.forEach(cat => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = cat.name;
                div.addEventListener('click', () => {
                    // カンマ区切りの最後の要素を選択したカテゴリに置き換える
                    const categories = categoriesInput.value.split(',');
                    categories.pop();
                    categories.push(cat.name);
                    categoriesInput.value = categories.join(', ') + (categories.length > 0 ? ' ' : '');
                    categorySuggestions.style.display = 'none';
                    categoriesInput.focus();
                });
                categorySuggestions.appendChild(div);
            });
            categorySuggestions.style.display = 'block';
        } else {
            categorySuggestions.style.display = 'none';
        }
    } else {
        categorySuggestions.style.display = 'none';
    }
});

// カテゴリ追加フォームの送信処理
addCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('new-category-name').value;
    
    if (categoryName.trim() === '') {
        displayError('カテゴリ名を入力してください');
        return;
    }
    
    try {
        await apiRequest('/categories', 'POST', { name: categoryName });
        document.getElementById('new-category-name').value = '';
        fetchCategories();
    } catch (error) {
        displayError(error.message);
    }
});

// 新規メモ作成ボタンの追加
const createNoteButton = document.createElement('button');
createNoteButton.textContent = '新規日記作成';
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
    document.getElementById('categories').value = '';
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

// クリック以外でカテゴリ候補を閉じる
document.addEventListener('click', (e) => {
    if (!categorySuggestions.contains(e.target) && e.target !== categoriesInput) {
        categorySuggestions.style.display = 'none';
    }
});

//初期化する
updateAuthStatus();

// ページ読み込み時にトークンの検証を行う
const validateToken = async () => {
    if (!token) return;
    
    try {
        // トークン検証のためにシンプルなAPIリクエストを送信
        await apiRequest('/notes', 'GET');
        console.log('トークン検証成功');
    } catch (error) {
        console.error('トークン検証失敗:', error);
        // エラーハンドリングはapiRequest内で行われるため、ここでは何もしない
    }
};

// ページ読み込み時に実行
validateToken();

