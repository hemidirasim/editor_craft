// Dashboard functionality
let configurations = [];
let editingConfigId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/dashboard') {
        loadConfigurations();
        updateStatistics();
    }
});

// Load configurations
async function loadConfigurations() {
    try {
        const response = await apiRequest('/api/editors');
        configurations = response.configs;
        renderConfigurations();
        updateStatistics();
    } catch (error) {
        console.error('Failed to load configurations:', error);
        showNotification('Failed to load configurations', 'error');
    }
}

// Render configurations
function renderConfigurations() {
    const configsGrid = document.getElementById('configsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!configsGrid) return;
    
    if (configurations.length === 0) {
        configsGrid.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    configsGrid.style.display = 'grid';
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    configsGrid.innerHTML = configurations.map(config => `
        <div class="config-card ${config.is_active ? 'active' : 'inactive'}" onclick="editConfiguration(${config.id})">
            <div class="config-header">
                <div>
                    <div class="config-name">${config.name}</div>
                    <div class="config-meta">Created ${formatDate(config.created_at)}</div>
                </div>
                <div class="config-status ${config.is_active ? 'active' : 'inactive'}">
                    ${config.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>
            
            <div class="config-features">
                ${getFeatureTags(config.config_data)}
            </div>
            
            <div class="config-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); getEmbedCode(${config.id})">
                    <i class="fas fa-code"></i>
                    Embed
                </button>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); toggleConfigStatus(${config.id})">
                    <i class="fas fa-${config.is_active ? 'pause' : 'play'}"></i>
                    ${config.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); deleteConfiguration(${config.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Get feature tags from configuration
function getFeatureTags(configData) {
    const config = typeof configData === 'string' ? JSON.parse(configData) : configData;
    const features = [];
    
    if (config.features) {
        if (config.features.bold) features.push('Bold/Italic');
        if (config.features.alignment) features.push('Alignment');
        if (config.features.lists) features.push('Lists');
        if (config.features.links) features.push('Links');
        if (config.features.images) features.push('Images');
        if (config.features.tables) features.push('Tables');
        if (config.features.undo) features.push('Undo/Redo');
        if (config.features.save) features.push('Auto Save');
    }
    
    return features.map(feature => `<span class="feature-tag">${feature}</span>`).join('');
}

// Update statistics
function updateStatistics() {
    const totalConfigs = document.getElementById('totalConfigs');
    const activeConfigs = document.getElementById('activeConfigs');
    
    if (totalConfigs) {
        totalConfigs.textContent = configurations.length;
    }
    
    if (activeConfigs) {
        const activeCount = configurations.filter(config => config.is_active).length;
        activeConfigs.textContent = activeCount;
    }
}

// Filter configurations
function filterConfigs() {
    const searchTerm = document.getElementById('searchConfigs').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filteredConfigs = configurations.filter(config => {
        const matchesSearch = config.name.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && config.is_active) ||
            (statusFilter === 'inactive' && !config.is_active);
        
        return matchesSearch && matchesStatus;
    });
    
    renderFilteredConfigurations(filteredConfigs);
}

// Render filtered configurations
function renderFilteredConfigurations(filteredConfigs) {
    const configsGrid = document.getElementById('configsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!configsGrid) return;
    
    if (filteredConfigs.length === 0) {
        configsGrid.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No configurations found</h3>
                <p>Try adjusting your search criteria or create a new configuration.</p>
                <button class="btn btn-primary" onclick="openCreateModal()">
                    <i class="fas fa-plus"></i>
                    Create New Editor
                </button>
            `;
        }
        return;
    }
    
    configsGrid.style.display = 'grid';
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    configsGrid.innerHTML = filteredConfigs.map(config => `
        <div class="config-card ${config.is_active ? 'active' : 'inactive'}" onclick="editConfiguration(${config.id})">
            <div class="config-header">
                <div>
                    <div class="config-name">${config.name}</div>
                    <div class="config-meta">Created ${formatDate(config.created_at)}</div>
                </div>
                <div class="config-status ${config.is_active ? 'active' : 'inactive'}">
                    ${config.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>
            
            <div class="config-features">
                ${getFeatureTags(config.config_data)}
            </div>
            
            <div class="config-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); getEmbedCode(${config.id})">
                    <i class="fas fa-code"></i>
                    Embed
                </button>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); toggleConfigStatus(${config.id})">
                    <i class="fas fa-${config.is_active ? 'pause' : 'play'}"></i>
                    ${config.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); deleteConfiguration(${config.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Open create modal
function openCreateModal() {
    editingConfigId = null;
    document.getElementById('configModalTitle').textContent = 'Create New Editor Configuration';
    document.getElementById('configForm').reset();
    
    // Set default values
    document.getElementById('configHeight').value = '400';
    document.getElementById('configFontSize').value = '16';
    document.getElementById('configTheme').value = 'light';
    document.getElementById('configWidth').value = '100%';
    
    // Check all features by default
    const checkboxes = document.querySelectorAll('.feature-checkbox input');
    checkboxes.forEach(checkbox => checkbox.checked = true);
    
    document.getElementById('configModal').style.display = 'block';
}

// Edit configuration
function editConfiguration(configId) {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;
    
    editingConfigId = configId;
    document.getElementById('configModalTitle').textContent = 'Edit Editor Configuration';
    
    const configData = typeof config.config_data === 'string' ? JSON.parse(config.config_data) : config.config_data;
    
    // Fill form with existing data
    document.getElementById('configName').value = config.name;
    document.getElementById('configTheme').value = configData.theme || 'light';
    document.getElementById('configFontSize').value = configData.fontSize || '16';
    document.getElementById('configHeight').value = configData.height || '400';
    document.getElementById('configWidth').value = configData.width || '100%';
    
    // Set features
    const features = configData.features || {};
    document.getElementById('featureBold').checked = features.bold !== false;
    document.getElementById('featureAlignment').checked = features.alignment !== false;
    document.getElementById('featureLists').checked = features.lists !== false;
    document.getElementById('featureLinks').checked = features.links !== false;
    document.getElementById('featureImages').checked = features.images !== false;
    document.getElementById('featureTables').checked = features.tables !== false;
    document.getElementById('featureUndo').checked = features.undo !== false;
    document.getElementById('featureSave').checked = features.save !== false;
    
    document.getElementById('configModal').style.display = 'block';
}

// Close config modal
function closeConfigModal() {
    document.getElementById('configModal').style.display = 'none';
    editingConfigId = null;
}

// Handle configuration form submission
async function handleConfigSubmit(event) {
    event.preventDefault();
    
    const configData = {
        theme: document.getElementById('configTheme').value,
        fontSize: parseInt(document.getElementById('configFontSize').value),
        height: parseInt(document.getElementById('configHeight').value),
        width: document.getElementById('configWidth').value,
        features: {
            bold: document.getElementById('featureBold').checked,
            alignment: document.getElementById('featureAlignment').checked,
            lists: document.getElementById('featureLists').checked,
            links: document.getElementById('featureLinks').checked,
            images: document.getElementById('featureImages').checked,
            tables: document.getElementById('featureTables').checked,
            undo: document.getElementById('featureUndo').checked,
            save: document.getElementById('featureSave').checked
        }
    };
    
    const name = document.getElementById('configName').value;
    
    try {
        if (editingConfigId) {
            // Update existing configuration
            await apiRequest(`/api/editors/${editingConfigId}`, {
                method: 'PUT',
                body: JSON.stringify({ name, configData })
            });
            showNotification('Configuration updated successfully', 'success');
        } else {
            // Create new configuration
            await apiRequest('/api/editors', {
                method: 'POST',
                body: JSON.stringify({ name, configData })
            });
            showNotification('Configuration created successfully', 'success');
        }
        
        closeConfigModal();
        loadConfigurations();
    } catch (error) {
        console.error('Configuration save error:', error);
        showNotification('Failed to save configuration', 'error');
    }
}

// Get embed code
async function getEmbedCode(configId) {
    try {
        const response = await apiRequest(`/api/configs/${configId}/embed`);
        const embedCode = response.embedCode;
        
        document.getElementById('embedCode').value = embedCode;
        
        // Create preview
        const preview = document.getElementById('embedPreview');
        preview.innerHTML = `
            <div style="border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; background: white;">
                <h4 style="color: #007bff; margin-bottom: 10px;">Editor Preview</h4>
                <p style="color: #666; font-size: 14px;">This is how your editor will appear when embedded.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px;">
                    <code style="font-size: 12px; color: #666;">Embed code ready to copy</code>
                </div>
            </div>
        `;
        
        document.getElementById('embedModal').style.display = 'block';
    } catch (error) {
        console.error('Failed to get embed code:', error);
        showNotification('Failed to get embed code', 'error');
    }
}

// Close embed modal
function closeEmbedModal() {
    document.getElementById('embedModal').style.display = 'none';
}

// Copy embed code
function copyEmbedCode() {
    const embedCode = document.getElementById('embedCode');
    embedCode.select();
    embedCode.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showNotification('Embed code copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy embed code', 'error');
    }
}

// Toggle configuration status
async function toggleConfigStatus(configId) {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;
    
    try {
        const newStatus = !config.is_active;
        await apiRequest(`/api/editors/${configId}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_active: newStatus })
        });
        
        showNotification(`Configuration ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        loadConfigurations();
    } catch (error) {
        console.error('Failed to toggle status:', error);
        showNotification('Failed to update configuration status', 'error');
    }
}

// Delete configuration
async function deleteConfiguration(configId) {
    if (!confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiRequest(`/api/editors/${configId}`, {
            method: 'DELETE'
        });
        
        showNotification('Configuration deleted successfully', 'success');
        loadConfigurations();
    } catch (error) {
        console.error('Failed to delete configuration:', error);
        showNotification('Failed to delete configuration', 'error');
    }
}

// Refresh configurations
function refreshConfigs() {
    loadConfigurations();
    showNotification('Configurations refreshed', 'success');
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const configModal = document.getElementById('configModal');
    const embedModal = document.getElementById('embedModal');
    
    if (event.target === configModal) {
        closeConfigModal();
    }
    
    if (event.target === embedModal) {
        closeEmbedModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeConfigModal();
        closeEmbedModal();
    }
});
