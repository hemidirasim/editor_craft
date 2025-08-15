const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all editor configurations for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [configs] = await pool.execute(
      'SELECT * FROM editor_configs WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ configs });
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: 'Failed to get configurations' });
  }
});

// Create new editor configuration
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, configData } = req.body;

    if (!name || !configData) {
      return res.status(400).json({ error: 'Name and configuration data are required' });
    }

    // Generate embed code
    const embedCode = generateEmbedCode(configData);

    const [result] = await pool.execute(
      'INSERT INTO editor_configs (user_id, name, config_data, embed_code) VALUES (?, ?, ?, ?)',
      [req.user.userId, name, JSON.stringify(configData), embedCode]
    );

    const [newConfig] = await pool.execute(
      'SELECT * FROM editor_configs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ config: newConfig[0] });
  } catch (error) {
    console.error('Create config error:', error);
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

// Update editor configuration
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, configData } = req.body;

    if (!name || !configData) {
      return res.status(400).json({ error: 'Name and configuration data are required' });
    }

    // Check if config belongs to user
    const [existingConfigs] = await pool.execute(
      'SELECT id FROM editor_configs WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (existingConfigs.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Generate new embed code
    const embedCode = generateEmbedCode(configData);

    await pool.execute(
      'UPDATE editor_configs SET name = ?, config_data = ?, embed_code = ? WHERE id = ?',
      [name, JSON.stringify(configData), embedCode, id]
    );

    const [updatedConfig] = await pool.execute(
      'SELECT * FROM editor_configs WHERE id = ?',
      [id]
    );

    res.json({ config: updatedConfig[0] });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Delete editor configuration
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if config belongs to user
    const [existingConfigs] = await pool.execute(
      'SELECT id FROM editor_configs WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (existingConfigs.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    await pool.execute('DELETE FROM editor_configs WHERE id = ?', [id]);

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

// Get editor content
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params;

    const [content] = await pool.execute(
      'SELECT * FROM editor_content WHERE config_id = ? ORDER BY version DESC LIMIT 1',
      [id]
    );

    if (content.length === 0) {
      return res.json({ content: null });
    }

    res.json({ content: content[0] });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
});

// Save editor content
router.post('/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { contentData } = req.body;

    if (!contentData) {
      return res.status(400).json({ error: 'Content data is required' });
    }

    // Get current version
    const [currentContent] = await pool.execute(
      'SELECT version FROM editor_content WHERE config_id = ? ORDER BY version DESC LIMIT 1',
      [id]
    );

    const newVersion = currentContent.length > 0 ? currentContent[0].version + 1 : 1;

    const [result] = await pool.execute(
      'INSERT INTO editor_content (config_id, content_data, version) VALUES (?, ?, ?)',
      [id, JSON.stringify(contentData), newVersion]
    );

    res.status(201).json({ 
      message: 'Content saved successfully',
      version: newVersion
    });
  } catch (error) {
    console.error('Save content error:', error);
    res.status(500).json({ error: 'Failed to save content' });
  }
});

// Generate embed code based on configuration
function generateEmbedCode(configData) {
  const config = JSON.stringify(configData);
  return `
<script src="/js/editorcraft-embed.js"></script>
<div id="editorcraft-container"></div>
<script>
  EditorCraft.init({
    containerId: 'editorcraft-container',
    config: ${config}
  });
</script>`;
}

module.exports = router;
