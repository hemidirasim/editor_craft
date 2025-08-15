# EditorCraft - Modern WYSIWYG Rich Text Editor Platform

EditorCraft is a powerful and modern WYSIWYG rich text editor platform that allows users to create customizable editors and embed them into their websites with just a few lines of code.

## 🌟 Features

### Core Features
- **WYSIWYG Editor**: Full-featured rich text editor with real-time preview
- **Live Demo**: Interactive demo page to test all editor features
- **Dashboard**: User-friendly dashboard to manage editor configurations
- **Embed System**: Easy-to-use embed codes for website integration
- **Customization**: Highly customizable themes, features, and settings
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### Editor Features
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Text Alignment**: Left, center, right, justify alignment
- **Lists**: Bullet and numbered lists with indentation
- **Links**: Insert and manage hyperlinks
- **Images**: Insert images with alt text support
- **Tables**: Create and edit tables with customizable rows and columns
- **Undo/Redo**: Full undo and redo functionality
- **Auto Save**: Automatic content saving with version control
- **Paste Cleanup**: Smart paste handling with HTML cleaning
- **Keyboard Shortcuts**: Common shortcuts (Ctrl+B, Ctrl+I, etc.)

### Platform Features
- **User Authentication**: Secure registration and login system
- **Configuration Management**: Create, edit, and manage multiple editor configurations
- **Theme System**: Multiple built-in themes (Light, Dark, Blue, Green)
- **Feature Toggle**: Enable/disable specific editor features per configuration
- **Embed Code Generation**: Automatic embed code generation for each configuration
- **Statistics Dashboard**: Track usage and configuration statistics
- **API Integration**: RESTful API for backend integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hemidirasim/editor_craft.git
   cd editor_craft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy the config file
   cp config.env.example config.env
   
   # Edit the configuration file with your database credentials
   nano config.env
   ```

4. **Database Setup**
   ```bash
   # The application will automatically create the required tables
   # Make sure your MySQL database is running and accessible
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Main site: http://localhost:3000
   - Live demo: http://localhost:3000/live
   - Dashboard: http://localhost:3000/dashboard

## 📖 Usage

### For End Users

1. **Visit the Platform**
   - Go to the main page and click "Get Started"
   - Register a new account or login with existing credentials

2. **Create Editor Configuration**
   - Navigate to the dashboard
   - Click "Create New Editor"
   - Configure your editor settings:
     - Choose a theme (Light, Dark, Blue, Green)
     - Set font size and dimensions
     - Enable/disable features as needed
   - Save your configuration

3. **Get Embed Code**
   - Click "Embed" on your configuration
   - Copy the generated embed code
   - Paste it into your website

### Embed Code Example

```html
<script src="http://localhost:3000/js/editorcraft-embed.js"></script>
<div id="editorcraft-container"></div>
<script>
  EditorCraft.init({
    containerId: 'editorcraft-container',
    config: {
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
      }
    }
  });
</script>
```

### API Usage

The platform provides a RESTful API for integration:

#### Authentication
```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Editor Configurations
```bash
# Get all configurations
GET /api/editors
Authorization: Bearer <token>

# Create configuration
POST /api/editors
Authorization: Bearer <token>
{
  "name": "My Editor",
  "configData": {
    "theme": "light",
    "fontSize": 16,
    "features": {
      "bold": true,
      "alignment": true
    }
  }
}

# Get embed code
GET /api/configs/{id}/embed
```

## 🏗️ Architecture

### Backend
- **Node.js** with Express.js framework
- **MySQL** database with connection pooling
- **JWT** authentication
- **bcrypt** password hashing
- **Helmet** security middleware
- **Rate limiting** for API protection

### Frontend
- **Vanilla JavaScript** for core functionality
- **CSS Grid** and **Flexbox** for responsive layouts
- **Font Awesome** icons
- **Local Storage** for client-side caching
- **Custom embed script** for website integration

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Editor configurations
CREATE TABLE editor_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  config_data JSON NOT NULL,
  embed_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Editor content
CREATE TABLE editor_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_id INT NOT NULL,
  content_data LONGTEXT NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (config_id) REFERENCES editor_configs(id)
);
```

## 🎨 Customization

### Themes
The platform supports multiple themes:
- **Light**: Clean, modern light theme
- **Dark**: Elegant dark theme
- **Blue**: Professional blue theme
- **Green**: Fresh green theme

### Features
Each editor configuration can have the following features enabled/disabled:
- Text formatting (bold, italic, underline)
- Text alignment
- Lists (bullet and numbered)
- Links insertion
- Image insertion
- Table creation
- Undo/Redo functionality
- Auto-save

### Styling
The embed script automatically includes CSS styles, but you can customize them by overriding the CSS classes:
- `.editorcraft-wrapper`: Main editor container
- `.editorcraft-toolbar`: Toolbar styling
- `.editorcraft-content`: Content area styling
- `.editorcraft-btn`: Button styling

## 🔧 Development

### Project Structure
```
editorcraft/
├── config/
│   └── database.js          # Database configuration
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── editors.js          # Editor management routes
│   └── configs.js          # Configuration routes
├── public/
│   ├── css/
│   │   ├── style.css       # Main styles
│   │   ├── editor.css      # Editor styles
│   │   └── dashboard.css   # Dashboard styles
│   ├── js/
│   │   ├── main.js         # Main functionality
│   │   ├── editor.js       # Editor functionality
│   │   ├── dashboard.js    # Dashboard functionality
│   │   └── editorcraft-embed.js # Embed script
│   ├── index.html          # Main page
│   ├── live.html           # Live demo page
│   └── dashboard.html      # Dashboard page
├── server.js               # Main server file
├── package.json            # Dependencies
└── README.md              # Documentation
```

### Scripts
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Environment Variables
```env
# Database Configuration
DB_HOST=j3nq.your-database.de
DB_USER=editor_crat_ne
DB_PASSWORD=X19H1z9A6hZFhTf1
DB_NAME=editor_crat_new

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: HTML sanitization and CSP headers
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet**: Security headers middleware
- **CORS**: Configurable cross-origin resource sharing

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub
- **Email**: Contact the development team for support

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   PORT=3000
   ```

2. **Database Migration**
   ```bash
   # Tables are created automatically on first run
   ```

3. **Start Application**
   ```bash
   npm start
   ```

4. **Reverse Proxy (Optional)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 📈 Performance

- **Database Connection Pooling**: Optimized database connections
- **Static File Caching**: Efficient static file serving
- **Minified Assets**: Production-ready minified JavaScript and CSS
- **Lazy Loading**: On-demand feature loading
- **Debounced Auto-save**: Optimized content saving

---

**EditorCraft** - Empowering content creation with modern WYSIWYG editing technology.
