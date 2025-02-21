let currentTab = 'word';
let wordData = [];
let grammarData = [];

// 加载数据
async function loadData() {
    try {
        const wordResponse = await fetch('./json/word.json');
        const word1Response = await fetch('./json/word1.json');
        const word2Response = await fetch('./json/word2.json');
        const grammarResponse = await fetch('./json/grammar.json');
        const grammar1Response = await fetch('./json/grammar1.json');
        
        wordData = await wordResponse.json();
        wordData = wordData.concat(await word1Response.json(), await word2Response.json());
        grammarData = await grammarResponse.json();
        grammarData = grammarData.concat(await grammar1Response.json());
        
        
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
    let hasResult = false;
    wordData.forEach(lesson => {
        lesson.data.forEach(word => {
            let [japanese, chinese = '', tone = '', loc = ''] = word;
            if (japanese.toLowerCase().includes(searchText) || 
                chinese.toLowerCase().includes(searchText)) {
                const div = document.createElement('div');
                japanese = renderTone(japanese, tone);
                div.className = 'result-item';
                div.innerHTML = `
                    <div>${lesson.book} ${lesson.title}</div>
                    <div>${japanese}</div>
                    <div>${chinese}</div>
                    <div>${loc}</div>
                `;
                container.appendChild(div);
                hasResult = true;
            }
        });
    });
    if (!hasResult) {
        const div = document.createElement('div');
        div.className = 'no-result';
        div.innerHTML = '没有找到相关内容';
        container.appendChild(div); 
    }
}

/**
 * @param {string} japanese
 * @param {string} tone
 * @returns {string}
 */
function renderTone(japanese, tones) {
    if (!tones) {
        return japanese;
    }

    let text = '';
    let arr = japanese.split('(');
    let kana = arr[0];
    let startIndex = 0;
    tones = tones.split('|');
    tones.forEach((item, i) => {
        let tone = item.split(',');
        let start = Number(tone[0]), end = Number(tone[1]);
        text += kana.slice(startIndex, start);
        if (tone.length === 1) {
            text += `<span class="tone">${kana.slice(start)}</span>`;
            startIndex = start;
        } else {
            text += `<span class="tone">${kana.slice(start, end + 1)}</span>`;
            startIndex = end + 1;
            if (i == tones.length - 1) {
                text += kana.slice(end + 1);
            }
        }
    });
    if (arr[1]) {
        text += '(' + arr[1];
    }
    return text;
}

// 搜索语法
function searchGrammar(searchText, container) {
    let hasResult = false;
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
                    hasResult = true;
                }
            }
        });
    });
    if (!hasResult) {
        const div = document.createElement('div');
        div.className = 'no-result';
        div.innerHTML = '没有找到相关内容';
        container.appendChild(div); 
    }
}

// 页面加载时初始化数据
loadData();