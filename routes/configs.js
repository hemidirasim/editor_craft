const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get public configuration by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [configs] = await pool.execute(
      'SELECT id, name, config_data, embed_code FROM editor_configs WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const config = configs[0];
    config.config_data = JSON.parse(config.config_data);

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

    const [configs] = await pool.execute(
      'SELECT embed_code FROM editor_configs WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ embedCode: configs[0].embed_code });
  } catch (error) {
    console.error('Get embed code error:', error);
    res.status(500).json({ error: 'Failed to get embed code' });
  }
});

module.exports = router;
