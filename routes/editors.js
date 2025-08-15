const express = require('express');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

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
    const configs = await prisma.editorConfig.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

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

    const newConfig = await prisma.editorConfig.create({
      data: {
        userId: req.user.userId,
        name,
        configData,
        embedCode
      }
    });

    res.status(201).json({ config: newConfig });
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
    const existingConfig = await prisma.editorConfig.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.userId 
      }
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Generate new embed code
    const embedCode = generateEmbedCode(configData);

    const updatedConfig = await prisma.editorConfig.update({
      where: { id: parseInt(id) },
      data: {
        name,
        configData,
        embedCode
      }
    });

    res.json({ config: updatedConfig });
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
    const existingConfig = await prisma.editorConfig.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.userId 
      }
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    await prisma.editorConfig.delete({
      where: { id: parseInt(id) }
    });

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

    const content = await prisma.editorContent.findFirst({
      where: { configId: parseInt(id) },
      orderBy: { version: 'desc' }
    });

    if (!content) {
      return res.json({ content: null });
    }

    res.json({ content });
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
    const currentContent = await prisma.editorContent.findFirst({
      where: { configId: parseInt(id) },
      orderBy: { version: 'desc' }
    });

    const newVersion = currentContent ? currentContent.version + 1 : 1;

    const result = await prisma.editorContent.create({
      data: {
        configId: parseInt(id),
        contentData: JSON.stringify(contentData),
        version: newVersion
      }
    });

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
