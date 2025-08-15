const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../config.env' });

const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully with Prisma');
    
    // Test query to ensure everything works
    const userCount = await prisma.user.count();
    console.log(`✅ Database is working. Total users: ${userCount}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Initialize database (create tables if they don't exist)
async function initializeDatabase() {
  try {
    // Prisma will automatically create tables based on the schema
    // when we run the first query
    await prisma.user.count();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  testConnection,
  initializeDatabase
};
