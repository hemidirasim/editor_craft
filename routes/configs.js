const express = require('express');
const { prisma } = require('../config/database');

const router = express.Router();

// Get public configuration by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const config = await prisma.editorConfig.findFirst({
      where: { 
        id: parseInt(id),
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        configData: true,
        embedCode: true
      }
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

// Get embed code for a configuration
router.get('/:id/embed', async (req, res) => {
  try {
    const { id } = req.params;

    const config = await prisma.editorConfig.findFirst({
      where: { 
        id: parseInt(id),
        isActive: true 
      },
      select: {
        embedCode: true
      }
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ embedCode: config.embedCode });
  } catch (error) {
    console.error('Get embed code error:', error);
    res.status(500).json({ error: 'Failed to get embed code' });
  }
});

module.exports = router;
