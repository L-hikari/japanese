let currentTab = 'word';
let wordData = [];
let grammarData = [];
let flatWordData = [];
let flatGrammarData = [];
let wordSearchRes = [];
let grammarSearchRes = [];
let searchText;
let resultContainer = document.getElementById('resultContainer');
let pagination = document.querySelector('.pagination');

const itemsPerPage = 10;
let currentPage = 1;

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

        for (let i = 0; i < wordData.length; i++) {
            const lesson = wordData[i];
            for (let j = 0; j < lesson.data.length; j++) {
                const word = lesson.data[j];
                word.book = lesson.book;
                word.title = lesson.title;
                flatWordData.push(word);
            }
        }
        for (let i = 0; i < grammarData.length; i++) {
            const lesson = grammarData[i];
            for (let j = 0; j < lesson.data.length; j++) {
                const grammar = lesson.data[j];
                grammar.book = lesson.book;
                grammar.title = lesson.title;
                flatGrammarData.push(grammar);
            }
        }

        displayItems(currentPage, flatWordData);
        setupPagination(flatWordData);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// 切换标签页
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
    currentPage = 1;
    let res = tab === 'word' ? flatWordData : flatGrammarData
    displayItems(currentPage, res);
    setupPagination(res);
}

// 搜索功能
function search() {
    currentPage = 1;
    wordSearchRes = [];
    grammarSearchRes = [];
    searchText = document.getElementById('searchInput').value.toLowerCase();
    resultContainer.innerHTML = '';

    if (!searchText) searchText = '';

    if (currentTab === 'word') {
        searchWords(searchText);
    } else {
        searchGrammar(searchText);
    }
}

// 搜索单词
function searchWords(searchText) {
    let hasResult = false;
    for (let i = 0; i < flatWordData.length; i++) {
        const [japanese, chinese = ''] = flatWordData[i];
        if (
            japanese.toLowerCase().includes(searchText) ||
            chinese.toLowerCase().includes(searchText)
        ) {
            wordSearchRes.push(flatWordData[i]);
            hasResult = true;
        }
    }
    if (hasResult) {
        displayItems(currentPage, wordSearchRes);
        setupPagination(wordSearchRes);
    } else {
        const div = document.createElement('div');
        div.className = 'no-result';
        div.innerHTML = '没有找到相关内容';
        resultContainer.appendChild(div);
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
        let start = Number(tone[0]),
            end = Number(tone[1]);
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
function searchGrammar(searchText) {
    let hasResult = false;
    for (let i = 0; i < flatGrammarData.length; i++) {
        const [type, content] = flatGrammarData[i];
        if (type.toLowerCase().includes(searchText) || content.toLowerCase().includes(searchText)) {
            grammarSearchRes.push(flatGrammarData[i]);
            hasResult = true;
        }
    }
    if (hasResult) {
        displayItems(currentPage, grammarSearchRes);
        setupPagination(grammarSearchRes);
    } else {
        const div = document.createElement('div');
        div.className = 'no-result';
        div.innerHTML = '没有找到相关内容';
        resultContainer.appendChild(div);
    }
}

// 页面加载时初始化数据
loadData();

function createWord(word) {
    let [japanese, chinese = '', tone = '', loc = ''] = word;
    const div = document.createElement('div');
    japanese = renderTone(japanese, tone);
    div.className = 'result-item';
    div.innerHTML = `
            <div>${word.book} ${word.title}</div>
            <div>${japanese}</div>
            <div>${chinese}</div>
            <div>${loc}</div>
        `;
    return div;
}

function createGrammar(grammar) {
    const [type, content] = grammar;
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
                        <div>${grammar.book} ${grammar.title}</div>
                        <div>${type}</div>
                        <div>${content}</div>
                    `;
    return div;
}

function displayItems(page, items) {
    resultContainer.innerHTML = '';
    page--;
    let start = itemsPerPage * page;
    let end = start + itemsPerPage;
    let paginatedItems = items.slice(start, end);

    for (let i = 0; i < paginatedItems.length; i++) {
        let item = paginatedItems[i];
        let div = currentTab === 'word' ? createWord(item) : createGrammar(item);
        // let itemElement = document.createElement('div');
        // itemElement.classList.add('item');
        // itemElement.innerText = item;
        resultContainer.appendChild(div);
    }
}

function setupPagination(items) {
    pagination.innerHTML = '';
    pagination.appendChild(createPageItem('上一页', currentPage > 1));

    let pageCount = Math.ceil(items.length / itemsPerPage);
    let maxPageVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageVisible / 2));
    let endPage = Math.min(pageCount, startPage + maxPageVisible - 1);

    if (startPage > 1) {
        pagination.appendChild(paginationButton(1));
        if (startPage > 2) pagination.appendChild(createEllipsis());
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(paginationButton(i));
    }

    if (endPage < pageCount) {
        if (endPage < pageCount - 1) pagination.appendChild(createEllipsis());
        pagination.appendChild(paginationButton(pageCount));
    }

    pagination.appendChild(createPageItem('下一页', currentPage < pageCount));
    attachEventsToPageItems(items);
}

function paginationButton(page) {
    let button = document.createElement('li');
    button.innerText = page;
    button.className = currentPage === page ? 'active' : '';
    button.dataset.page = page;
    return button;
}

function createEllipsis() {
    let ellipsis = document.createElement('li');
    ellipsis.innerText = '...';
    return ellipsis;
}

function createPageItem(text, enabled) {
    let pageItem = document.createElement('li');
    pageItem.innerText = text;
    pageItem.className = enabled ? '' : 'disabled';
    pageItem.dataset.page = text === '上一页' ? currentPage - 1 : currentPage + 1;
    return pageItem;
}

function attachEventsToPageItems() {
    document.querySelectorAll('.pagination li').forEach(item => {
        if (!item.classList.contains('disabled') && !item.classList.contains('active')) {
            item.addEventListener('click', function () {
                currentPage = parseInt(this.dataset.page);
                let res = [];
                if (searchText) {
                    res = currentTab === 'word' ? wordSearchRes : grammarSearchRes;
                } else {
                    res = currentTab === 'word' ? flatWordData : flatGrammarData;
                }
                displayItems(currentPage, res);
                setupPagination(res);
            });
        }
    });
}
