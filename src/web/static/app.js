let currentFileId = null;
let selectedContext = [];

async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const files = await response.json();
        renderFileList(files);
    } catch (error) {
        console.error('Error loading files:', error);
        document.getElementById('file-list').innerHTML = '<p class="placeholder">加载失败</p>';
    }
}

function renderFileList(files) {
    const container = document.getElementById('file-list');
    if (files.length === 0) {
        container.innerHTML = '<p class="placeholder">暂无文件</p>';
        return;
    }
    container.innerHTML = files.map(file => `
        <div class="file-item" data-id="${file.id}" data-path="${file.path}">
            <div class="file-name">${file.path.split('/').pop()}</div>
            <div class="file-path">${file.path}</div>
        </div>
    `).join('');

    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            loadFileDetails(parseInt(item.dataset.id), item.dataset.path);
        });
    });
}

async function loadFileDetails(fileId, filePath) {
    currentFileId = fileId;
    document.getElementById('selected-file-title').textContent = filePath;

    try {
        const response = await fetch(`/api/file/${fileId}`);
        const data = await response.json();
        renderFileDetails(data, filePath);
    } catch (error) {
        console.error('Error loading file details:', error);
        document.getElementById('file-details').innerHTML = '<p class="placeholder">加载失败</p>';
    }
}

function renderFileDetails(data, filePath) {
    const container = document.getElementById('file-details');
    let html = '';

    if (data.functions && data.functions.length > 0) {
        html += `
            <div class="section">
                <div class="section-title">函数 (${data.functions.length})</div>
                ${data.functions.map(func => `
                    <div class="item">
                        <div class="item-name">${func.name}</div>
                        <div class="item-lines">第 ${func.line_start} - ${func.line_end} 行</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (data.classes && data.classes.length > 0) {
        data.classes.forEach(cls => {
            const methods = cls.methods || [];
            html += `
                <div class="section">
                    <div class="section-title">类: ${cls.name} (${methods.length} 个方法)</div>
                    <div class="class-content">
                        ${methods.map(method => `
                            <div class="item method-item">
                                <div class="item-name">${method.name}</div>
                                <div class="item-lines">第 ${method.line_start} - ${method.line_end} 行</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    }

    if (data.imports && data.imports.length > 0) {
        html += `
            <div class="section">
                <div class="section-title">导入 (${data.imports.length})</div>
                ${data.imports.map(imp => `
                    <div class="item">
                        <div class="item-name">${imp.symbol}</div>
                        <div class="item-lines">来自: ${imp.source}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (!html) {
        html = '<p class="placeholder">该文件暂无解析数据</p>';
    }

    container.innerHTML = html;

    selectedContext = [];
    if (data.functions) {
        selectedContext.push(...data.functions.map(f => ({ file: filePath, content: f.content })));
    }
    if (data.classes) {
        data.classes.forEach(cls => {
            if (cls.methods) {
                selectedContext.push(...cls.methods.map(m => ({
                    file: `${filePath}#${cls.name}`,
                    content: m.content
                })));
            }
        });
    }
}

async function queryLLM() {
    const query = document.getElementById('query-input').value.trim();
    if (!query) {
        alert('请输入查询内容');
        return;
    }

    const resultContainer = document.getElementById('query-result');
    resultContainer.innerHTML = '<p class="loading">正在查询...</p>';

    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                context: selectedContext
            })
        });

        const data = await response.json();
        renderQueryResult(data.result);
    } catch (error) {
        console.error('Error querying LLM:', error);
        resultContainer.innerHTML = '<p class="placeholder">查询失败</p>';
    }
}

function renderQueryResult(result) {
    const container = document.getElementById('query-result');
    container.innerHTML = formatMarkdown(result);
}

function formatMarkdown(text) {
    let formatted = text
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    return formatted;
}

document.getElementById('query-btn').addEventListener('click', queryLLM);
document.getElementById('query-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        queryLLM();
    }
});

loadFiles();
setInterval(loadFiles, 5000);
