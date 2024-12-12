let currentTab = 'word';
let wordData = [];
let grammarData = [];

// 加载数据
async function loadData() {
    try {
        const wordResponse = await fetch('./elementary/up/word.json');
        const grammarResponse = await fetch('./elementary/up/grammar.json');
        
        wordData = await wordResponse.json();
        grammarData = await grammarResponse.json();
        console.log(grammarData);
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// 切换标签页
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
    search();
}

// 搜索功能
function search() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';

    if (!searchText) return;

    if (currentTab === 'word') {
        searchWords(searchText, resultContainer);
    } else {
        searchGrammar(searchText, resultContainer);
    }
}

// 搜索单词
function searchWords(searchText, container) {
    wordData.forEach(lesson => {
        lesson.data.forEach(word => {
            let [japanese, chinese = '', tone = ''] = word;
            if (japanese.toLowerCase().includes(searchText) || 
                chinese.toLowerCase().includes(searchText)) {
                const div = document.createElement('div');
                japanese = renderTone(japanese, tone);
                div.className = 'result-item';
                div.innerHTML = `
                    <div>${lesson.book} ${lesson.title}</div>
                    <div>${japanese}</div>
                    <div>${chinese}</div>
                `;
                container.appendChild(div);
            }
        });
    });
}

/**
 * @param {string} japanese
 * @param {string} tone
 * @returns {string}
 */
function renderTone(japanese, tone) {
    if (!tone) {
        return japanese;
    }
    let text = '';
    let arr = japanese.split('(');
    let kana = arr[0];
    tone.split('|').forEach(item => {
        let tones = item.split(',');
        text += kana.slice(0, tones[0]);
        if (tones.length === 1) {
            text += `<span class="tone">${kana.slice(Number(tones[0]))}</span>`;
        } else {
            text += `<span class="tone">${kana.slice(Number(tones[0]), Number(tones[1]) + 1)}</span>`;
            text += kana.slice(Number(tones[1]) + 1);
        }
    });
    if (arr[1]) {
        text += '(' + arr[1];
    }
    return text;
}

// 搜索语法
function searchGrammar(searchText, container) {
    grammarData.forEach(lesson => {
        lesson.data.forEach(grammar => {
            if (grammar.length >= 2) {
                const [type, content] = grammar;
                if (type.toLowerCase().includes(searchText) || 
                    content.toLowerCase().includes(searchText)) {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `
                        <div>${lesson.book} ${lesson.title}</div>
                        <div>${type}</div>
                        <div>${content}</div>
                    `;
                    container.appendChild(div);
                }
            }
        });
    });
}

// 页面加载时初始化数据
loadData();
