// EditorCraft Embed Script
// This script allows users to embed the WYSIWYG editor into their websites

(function() {
    'use strict';
    
    // EditorCraft namespace
    window.EditorCraft = {
        // Initialize editor with configuration
        init: function(options) {
            const config = {
                containerId: 'editorcraft-container',
                theme: 'light',
                fontSize: 16,
                height: 400,
                width: '100%',
                features: {
                    bold: true,
                    alignment: true,
                    lists: true,
                    links: true,
                    images: true,
                    tables: true,
                    undo: true,
                    save: true
                },
                ...options
            };
            
            // Merge features
            if (options && options.config && options.config.features) {
                config.features = { ...config.features, ...options.config.features };
            }
            
            if (options && options.config) {
                config.theme = options.config.theme || config.theme;
                config.fontSize = options.config.fontSize || config.fontSize;
                config.height = options.config.height || config.height;
                config.width = options.config.width || config.width;
            }
            
            this.createEditor(config);
        },
        
        // Create editor instance
        createEditor: function(config) {
            const container = document.getElementById(config.containerId);
            if (!container) {
                console.error('EditorCraft: Container not found with ID:', config.containerId);
                return;
            }
            
            // Create editor HTML
            const editorHTML = this.generateEditorHTML(config);
            container.innerHTML = editorHTML;
            
            // Initialize editor functionality
            this.initializeEditorFunctionality(container, config);
        },
        
        // Generate editor HTML
        generateEditorHTML: function(config) {
            const toolbarHTML = this.generateToolbarHTML(config.features);
            const themeClass = `editorcraft-theme-${config.theme}`;
            
            return `
                <div class="editorcraft-wrapper ${themeClass}" style="width: ${config.width};">
                    <div class="editorcraft-toolbar">
                        ${toolbarHTML}
                    </div>
                    <div class="editorcraft-content" 
                         contenteditable="true" 
                         style="min-height: ${config.height}px; font-size: ${config.fontSize}px;">
                        <p>Start typing here...</p>
                    </div>
                </div>
            `;
        },
        
        // Generate toolbar HTML based on features
        generateToolbarHTML: function(features) {
            let toolbarHTML = '';
            
            // Text formatting
            if (features.bold) {
                toolbarHTML += `
                    <div class="editorcraft-toolbar-group">
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('bold')" title="Bold">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('italic')" title="Italic">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('underline')" title="Underline">
                            <i class="fas fa-underline"></i>
                        </button>
                    </div>
                `;
            }
            
            // Alignment
            if (features.alignment) {
                toolbarHTML += `
                    <div class="editorcraft-toolbar-group">
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('justifyLeft')" title="Align Left">
                            <i class="fas fa-align-left"></i>
                        </button>
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('justifyCenter')" title="Align Center">
                            <i class="fas fa-align-center"></i>
                        </button>
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('justifyRight')" title="Align Right">
                            <i class="fas fa-align-right"></i>
                        </button>
                    </div>
                `;
            }
            
            // Lists
            if (features.lists) {
                toolbarHTML += `
                    <div class="editorcraft-toolbar-group">
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('insertUnorderedList')" title="Bullet List">
                            <i class="fas fa-list-ul"></i>
                        </button>
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('insertOrderedList')" title="Numbered List">
                            <i class="fas fa-list-ol"></i>
                        </button>
                    </div>
                `;
            }
            
            // Links and media
            if (features.links) {
                toolbarHTML += `
                    <div class="editorcraft-toolbar-group">
                        <button class="editorcraft-btn" onclick="EditorCraft.insertLink()" title="Insert Link">
                            <i class="fas fa-link"></i>
                        </button>
                    </div>
                `;
            }
            
            if (features.images) {
                toolbarHTML += `
                    <div class="editorcraft-toolbar-group">
                        <button class="editorcraft-btn" onclick="EditorCraft.insertImage()" title="Insert Image">
                            <i class="fas fa-image"></i>
                        </button>
                    </div>
                `;
            }
            
            if (features.tables) {
                toolbarHTML += `
                    <div class="editorcraft-toolbar-group">
                        <button class="editorcraft-btn" onclick="EditorCraft.insertTable()" title="Insert Table">
                            <i class="fas fa-table"></i>
                        </button>
                    </div>
                `;
            }
            
            // Undo/Redo
            if (features.undo) {
                toolbarHTML += `
                    <div class="editorcraft-toolbar-group">
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('undo')" title="Undo">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="editorcraft-btn" onclick="EditorCraft.execCommand('redo')" title="Redo">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                `;
            }
            
            return toolbarHTML;
        },
        
        // Initialize editor functionality
        initializeEditorFunctionality: function(container, config) {
            const editor = container.querySelector('.editorcraft-content');
            const toolbar = container.querySelector('.editorcraft-toolbar');
            
            // Add event listeners
            editor.addEventListener('keyup', () => this.updateToolbarState(toolbar));
            editor.addEventListener('mouseup', () => this.updateToolbarState(toolbar));
            editor.addEventListener('input', () => this.updateToolbarState(toolbar));
            
            // Handle paste events
            editor.addEventListener('paste', (e) => this.handlePaste(e));
            
            // Auto-save if enabled
            if (config.features.save) {
                const debouncedSave = this.debounce(() => this.autoSave(editor), 2000);
                editor.addEventListener('input', debouncedSave);
            }
            
            // Store editor reference
            this.currentEditor = editor;
            this.currentConfig = config;
        },
        
        // Execute command
        execCommand: function(command, value = null) {
            if (this.currentEditor) {
                document.execCommand(command, false, value);
                this.currentEditor.focus();
                this.updateToolbarState();
            }
        },
        
        // Update toolbar state
        updateToolbarState: function(toolbar) {
            if (!toolbar) return;
            
            const buttons = toolbar.querySelectorAll('.editorcraft-btn');
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
        },
        
        // Insert link
        insertLink: function() {
            const url = prompt('Enter URL:');
            if (url) {
                const selection = window.getSelection();
                if (selection.toString()) {
                    this.execCommand('createLink', url);
                } else {
                    const linkText = prompt('Enter link text:');
                    if (linkText) {
                        const link = `<a href="${url}" target="_blank">${linkText}</a>`;
                        this.insertHTML(link);
                    }
                }
            }
        },
        
        // Insert image
        insertImage: function() {
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
                EditorCraft.insertHTML(tempImg);
                
                try {
                    // Create FormData
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    // Upload to server
                    const response = await fetch('/api/upload/image', {
                        method: 'POST',
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
                    const editor = EditorCraft.currentEditor;
                    editor.innerHTML = editor.innerHTML.replace(tempImg, img);
                    
                    // Show success message
                    console.log('Image uploaded successfully!');
                } catch (error) {
                    console.error('Upload error:', error);
                    
                    // Remove loading text
                    const editor = EditorCraft.currentEditor;
                    editor.innerHTML = editor.innerHTML.replace(tempImg, '');
                }
                
                // Clean up
                document.body.removeChild(fileInput);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
        },
        
        // Insert table
        insertTable: function() {
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
                
                this.insertHTML(tableHTML);
            }
        },
        
        // Insert HTML
        insertHTML: function(html) {
            if (!this.currentEditor) return;
            
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
                this.currentEditor.innerHTML += html;
            }
            
            this.currentEditor.focus();
            this.updateToolbarState();
        },
        
        // Handle paste
        handlePaste: function(event) {
            event.preventDefault();
            
            const text = event.clipboardData.getData('text/plain');
            const html = event.clipboardData.getData('text/html');
            
            if (html) {
                const cleanHTML = this.cleanPastedHTML(html);
                this.insertHTML(cleanHTML);
            } else if (text) {
                document.execCommand('insertText', false, text);
            }
        },
        
        // Clean pasted HTML
        cleanPastedHTML: function(html) {
            const div = document.createElement('div');
            div.innerHTML = html;
            
            // Remove unwanted elements
            const unwantedElements = div.querySelectorAll('script, style, meta, link, title');
            unwantedElements.forEach(el => el.remove());
            
            // Clean up styles
            const elements = div.querySelectorAll('*');
            elements.forEach(el => {
                el.removeAttribute('onclick');
                el.removeAttribute('onload');
                el.removeAttribute('onerror');
                
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
        },
        
        // Auto save
        autoSave: function(editor) {
            const content = editor.innerHTML;
            localStorage.setItem('editorcraft_autosave', content);
            
            // Trigger custom event
            const event = new CustomEvent('editorcraft:save', {
                detail: { content, timestamp: new Date().toISOString() }
            });
            document.dispatchEvent(event);
        },
        
        // Get content
        getContent: function() {
            return this.currentEditor ? this.currentEditor.innerHTML : '';
        },
        
        // Set content
        setContent: function(content) {
            if (this.currentEditor) {
                this.currentEditor.innerHTML = content;
            }
        },
        
        // Debounce utility
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .editorcraft-wrapper {
            border: 1px solid #e9ecef;
            border-radius: 6px;
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .editorcraft-toolbar {
            background: #f8f9fa;
            padding: 10px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .editorcraft-toolbar-group {
            display: flex;
            gap: 2px;
            margin-right: 10px;
            padding-right: 10px;
            border-right: 1px solid #e9ecef;
        }
        
        .editorcraft-toolbar-group:last-child {
            border-right: none;
            margin-right: 0;
        }
        
        .editorcraft-btn {
            width: 35px;
            height: 35px;
            border: none;
            background: transparent;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            transition: all 0.3s ease;
            font-size: 14px;
        }
        
        .editorcraft-btn:hover {
            background: #e9ecef;
            color: #333;
        }
        
        .editorcraft-btn.active {
            background: #007bff;
            color: white;
        }
        
        .editorcraft-content {
            padding: 20px;
            outline: none;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .editorcraft-content:focus {
            background: #fafbfc;
        }
        
        .editorcraft-content h1,
        .editorcraft-content h2,
        .editorcraft-content h3,
        .editorcraft-content h4,
        .editorcraft-content h5,
        .editorcraft-content h6 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .editorcraft-content p {
            margin-bottom: 15px;
        }
        
        .editorcraft-content ul,
        .editorcraft-content ol {
            margin-bottom: 15px;
            padding-left: 20px;
        }
        
        .editorcraft-content li {
            margin-bottom: 5px;
        }
        
        .editorcraft-content a {
            color: #007bff;
            text-decoration: underline;
        }
        
        .editorcraft-content a:hover {
            color: #0056b3;
        }
        
        .editorcraft-content img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        .editorcraft-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .editorcraft-content table td,
        .editorcraft-content table th {
            border: 1px solid #e9ecef;
            padding: 10px;
            text-align: left;
        }
        
        .editorcraft-content table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        
        /* Theme variations */
        .editorcraft-theme-dark {
            background: #2d3748;
            color: white;
        }
        
        .editorcraft-theme-dark .editorcraft-toolbar {
            background: #4a5568;
            border-bottom-color: #718096;
        }
        
        .editorcraft-theme-dark .editorcraft-btn {
            color: #e2e8f0;
        }
        
        .editorcraft-theme-dark .editorcraft-btn:hover {
            background: #718096;
            color: white;
        }
        
        .editorcraft-theme-dark .editorcraft-content {
            background: #2d3748;
            color: #e2e8f0;
        }
        
        .editorcraft-theme-dark .editorcraft-content:focus {
            background: #1a202c;
        }
        
        .editorcraft-theme-blue {
            background: #ebf8ff;
        }
        
        .editorcraft-theme-blue .editorcraft-toolbar {
            background: #bee3f8;
            border-bottom-color: #90cdf4;
        }
        
        .editorcraft-theme-blue .editorcraft-btn:hover {
            background: #90cdf4;
        }
        
        .editorcraft-theme-blue .editorcraft-content {
            background: #ebf8ff;
        }
        
        .editorcraft-theme-blue .editorcraft-content:focus {
            background: #e6fffa;
        }
        
        .editorcraft-theme-green {
            background: #f0fff4;
        }
        
        .editorcraft-theme-green .editorcraft-toolbar {
            background: #c6f6d5;
            border-bottom-color: #9ae6b4;
        }
        
        .editorcraft-theme-green .editorcraft-btn:hover {
            background: #9ae6b4;
        }
        
        .editorcraft-theme-green .editorcraft-content {
            background: #f0fff4;
        }
        
        .editorcraft-theme-green .editorcraft-content:focus {
            background: #e6fffa;
        }
    `;
    document.head.appendChild(style);
    
    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
})();
