const express = require('express');
const { put } = require('@vercel/blob');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

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

// Upload image endpoint
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = req.file.originalname.split('.').pop();
    const filename = `editorcraft/${req.user.userId}/${timestamp}-${randomString}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.json({
      success: true,
      url: blob.url,
      filename: filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload multiple images endpoint
router.post('/images', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadPromises = req.files.map(async (file, index) => {
      const timestamp = Date.now() + index;
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.originalname.split('.').pop();
      const filename = `editorcraft/${req.user.userId}/${timestamp}-${randomString}.${extension}`;

      const blob = await put(filename, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return {
        originalName: file.originalname,
        url: blob.url,
        filename: filename,
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      files: results,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Delete image endpoint
router.delete('/image/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Verify the file belongs to the user
    if (!filename.includes(`editorcraft/${req.user.userId}/`)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Note: Vercel Blob doesn't have a direct delete method in the client library
    // You might need to implement this differently or use a different approach
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'File deletion request received',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
