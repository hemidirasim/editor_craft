// Editor functionality for live demo
let editor = null;
let currentTheme = 'light';
let currentFontSize = 16;

// Initialize editor
document.addEventListener('DOMContentLoaded', function() {
    editor = document.getElementById('editor');
    if (editor) {
        initializeEditor();
        setupEditorEventListeners();
    }
});

// Initialize editor
function initializeEditor() {
    // Set initial content if empty
    if (!editor.innerHTML.trim()) {
        editor.innerHTML = `
            <h2>Welcome to EditorCraft Live Demo!</h2>
            <p>This is a fully functional WYSIWYG rich text editor. You can:</p>
            <ul>
                <li><strong>Format text</strong> using the toolbar buttons above</li>
                <li><em>Change themes</em> using the theme selector</li>
                <li><u>Insert links and images</u> with the media buttons</li>
                <li>Create <span style="color: #007bff;">colored text</span> and more!</li>
            </ul>
            <p>Try editing this content to see how powerful EditorCraft is!</p>
        `;
    }
    
    // Set initial theme and font size
    changeTheme();
    changeFontSize();
}

// Setup editor event listeners
function setupEditorEventListeners() {
    // Update toolbar state based on selection
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('input', updateToolbarState);
    
    // Handle paste events
    editor.addEventListener('paste', handlePaste);
    
    // Auto-save content
    const debouncedSave = debounce(saveContent, 2000);
    editor.addEventListener('input', debouncedSave);
}

// Execute command
function execCommand(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
    updateToolbarState();
}

// Update toolbar state based on current selection
function updateToolbarState() {
    const buttons = document.querySelectorAll('.toolbar-btn');
    
    buttons.forEach(button => {
        const command = button.getAttribute('onclick')?.match(/execCommand\('([^']+)'/)?.[1];
        if (command) {
            if (document.queryCommandState(command)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    });
}

// Change theme
function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        currentTheme = themeSelect.value;
        const editorWrapper = document.querySelector('.editor-wrapper');
        
        // Remove existing theme classes
        editorWrapper.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-green');
        
        // Add new theme class
        editorWrapper.classList.add(`theme-${currentTheme}`);
    }
}

// Change font size
function changeFontSize() {
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    if (fontSizeSelect) {
        currentFontSize = fontSizeSelect.value;
        editor.style.fontSize = `${currentFontSize}px`;
    }
}

// Clear content
function clearContent() {
    if (confirm('Are you sure you want to clear all content?')) {
        editor.innerHTML = '';
        showNotification('Content cleared', 'success');
    }
}

// Save content
async function saveContent() {
    try {
        const contentData = {
            html: editor.innerHTML,
            theme: currentTheme,
            fontSize: currentFontSize,
            timestamp: new Date().toISOString()
        };
        
        // In demo mode, just save to localStorage
        localStorage.setItem('editorcraft_demo_content', JSON.stringify(contentData));
        
        // Show save indicator
        showSaveIndicator();
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Failed to save content', 'error');
    }
}

// Show save indicator
function showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'saveIndicator';
    indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 15px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 1000;
        animation: fadeInOut 2s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        if (indicator.parentElement) {
            indicator.remove();
        }
    }, 2000);
}

// Load content
function loadContent() {
    try {
        const savedContent = localStorage.getItem('editorcraft_demo_content');
        if (savedContent) {
            const contentData = JSON.parse(savedContent);
            editor.innerHTML = contentData.html;
            
            // Restore theme and font size
            if (contentData.theme) {
                const themeSelect = document.getElementById('themeSelect');
                if (themeSelect) {
                    themeSelect.value = contentData.theme;
                    changeTheme();
                }
            }
            
            if (contentData.fontSize) {
                const fontSizeSelect = document.getElementById('fontSizeSelect');
                if (fontSizeSelect) {
                    fontSizeSelect.value = contentData.fontSize;
                    changeFontSize();
                }
            }
            
            showNotification('Content loaded', 'success');
        }
    } catch (error) {
        console.error('Load error:', error);
        showNotification('Failed to load content', 'error');
    }
}

// Insert link
function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        const selection = window.getSelection();
        if (selection.toString()) {
            execCommand('createLink', url);
        } else {
            const linkText = prompt('Enter link text:');
            if (linkText) {
                const link = `<a href="${url}" target="_blank">${linkText}</a>`;
                insertHTML(link);
            }
        }
    }
}

// Insert image
function insertImage() {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Show loading indicator
        const loadingText = 'Uploading image...';
        const tempImg = `<div style="text-align: center; padding: 20px; color: #666;">${loadingText}</div>`;
        insertHTML(tempImg);
        
        try {
            // Create FormData
            const formData = new FormData();
            formData.append('image', file);
            
            // Upload to server
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const result = await response.json();
            
            // Replace loading text with actual image
            const alt = prompt('Enter alt text (optional):');
            const img = `<img src="${result.url}" alt="${alt || ''}" style="max-width: 100%; height: auto; border-radius: 6px;">`;
            
            // Find and replace the loading text
            const editor = document.getElementById('editor');
            editor.innerHTML = editor.innerHTML.replace(tempImg, img);
            
            showNotification('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Failed to upload image', 'error');
            
            // Remove loading text
            const editor = document.getElementById('editor');
            editor.innerHTML = editor.innerHTML.replace(tempImg, '');
        }
        
        // Clean up
        document.body.removeChild(fileInput);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
}

// Insert table
function insertTable() {
    const rows = prompt('Enter number of rows (1-10):', '3');
    const cols = prompt('Enter number of columns (1-10):', '3');
    
    if (rows && cols) {
        const rowCount = Math.min(Math.max(parseInt(rows), 1), 10);
        const colCount = Math.min(Math.max(parseInt(cols), 1), 10);
        
        let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">';
        
        // Header row
        tableHTML += '<thead><tr>';
        for (let i = 0; i < colCount; i++) {
            tableHTML += `<th style="border: 1px solid #e9ecef; padding: 10px; background: #f8f9fa; font-weight: 600;">Header ${i + 1}</th>`;
        }
        tableHTML += '</tr></thead>';
        
        // Data rows
        tableHTML += '<tbody>';
        for (let i = 0; i < rowCount - 1; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < colCount; j++) {
                tableHTML += `<td style="border: 1px solid #e9ecef; padding: 10px;">Cell ${i + 1}-${j + 1}</td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        
        insertHTML(tableHTML);
    }
}

// Insert HTML at cursor position
function insertHTML(html) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const div = document.createElement('div');
        div.innerHTML = html;
        
        const fragment = document.createDocumentFragment();
        while (div.firstChild) {
            fragment.appendChild(div.firstChild);
        }
        
        range.insertNode(fragment);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        editor.innerHTML += html;
    }
    
    editor.focus();
    updateToolbarState();
}

// Handle paste events
function handlePaste(event) {
    event.preventDefault();
    
    const text = event.clipboardData.getData('text/plain');
    const html = event.clipboardData.getData('text/html');
    
    if (html) {
        // Clean HTML content
        const cleanHTML = cleanPastedHTML(html);
        insertHTML(cleanHTML);
    } else if (text) {
        // Insert plain text
        document.execCommand('insertText', false, text);
    }
}

// Clean pasted HTML
function cleanPastedHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove unwanted elements
    const unwantedElements = div.querySelectorAll('script, style, meta, link, title');
    unwantedElements.forEach(el => el.remove());
    
    // Clean up styles
    const elements = div.querySelectorAll('*');
    elements.forEach(el => {
        // Remove potentially dangerous attributes
        el.removeAttribute('onclick');
        el.removeAttribute('onload');
        el.removeAttribute('onerror');
        
        // Clean up styles
        if (el.style) {
            const allowedStyles = ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 'text-align', 'margin', 'padding'];
            const currentStyles = el.style.cssText.split(';');
            const cleanStyles = [];
            
            currentStyles.forEach(style => {
                const [property] = style.split(':');
                if (property && allowedStyles.includes(property.trim())) {
                    cleanStyles.push(style.trim());
                }
            });
            
            el.style.cssText = cleanStyles.join('; ');
        }
    });
    
    return div.innerHTML;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'b':
                event.preventDefault();
                execCommand('bold');
                break;
            case 'i':
                event.preventDefault();
                execCommand('italic');
                break;
            case 'u':
                event.preventDefault();
                execCommand('underline');
                break;
            case 'z':
                if (event.shiftKey) {
                    event.preventDefault();
                    execCommand('redo');
                } else {
                    event.preventDefault();
                    execCommand('undo');
                }
                break;
            case 's':
                event.preventDefault();
                saveContent();
                break;
        }
    }
});

// Auto-load content on page load
window.addEventListener('load', function() {
    setTimeout(loadContent, 500);
});
