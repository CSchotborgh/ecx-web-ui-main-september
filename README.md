
# EDGERACK Access - Enconnex

A Vue.js 3 web application for managing Enconnex EDGERACK cooling units with a modern, responsive interface supporting multiple themes.

## 🚀 Features

- **Multi-theme Support**: Super Dark, Dark, and Light themes with persistent state
- **Authentication System**: Secure login with CSRF protection and token validation
- **Responsive Design**: Built with TailwindCSS and Flowbite components
- **Hot Module Replacement**: Vite-powered development with instant updates
- **State Management**: Pinia stores for user authentication and theme management
- **Route Protection**: Authentication-required routes with automatic redirects

## 🛠 Tech Stack

- **Frontend Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Flowbite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Authentication**: JWT tokens with CSRF protection

## 📁 Project Structure

```
src/
├── assets/
│   ├── tailwind.css          # Custom styles and theme overrides
│   ├── persistState.js       # State persistence utility
│   └── sha256Worker.js       # Crypto worker for hashing
├── components/
│   ├── SiteNavigation.vue    # Main navigation component
│   ├── LoginModal.vue        # Authentication modal
│   ├── ThemeToggle.vue       # Theme switching component
│   └── ...                   # Other UI components
├── stores/
│   ├── user.js              # User authentication store
│   ├── theme.js             # Theme management store
│   └── index.js             # Pinia configuration
├── views/
│   ├── HomeView.vue         # Dashboard/landing page
│   ├── RCU.vue              # Cooling unit management
│   ├── Config.vue           # System configuration
│   ├── User.vue             # User management
│   └── Upgrade.vue          # System upgrades
├── router/
│   └── index.js             # Route definitions
├── App.vue                  # Root component
└── main.js                  # Application entry point
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edgerack-access
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔄 Application Workflow

### 1. Application Bootstrap
```mermaid
graph TD
    A[main.js] --> B[Create Vue App]
    B --> C[Register Pinia Store]
    C --> D[Register Vue Router]
    D --> E[Mount to #app]
    E --> F[App.vue Initialization]
```

### 2. Authentication Flow
```mermaid
graph TD
    A[User Access] --> B{Route Requires Auth?}
    B -->|No| C[Allow Access]
    B -->|Yes| D{User Logged In?}
    D -->|Yes| E[Validate Tokens]
    D -->|No| F[Show Login Modal]
    E -->|Valid| C
    E -->|Invalid| F
    F --> G[User Login]
    G --> H[Retrieve CSRF Token]
    H --> I[Submit Credentials]
    I --> J{Success?}
    J -->|Yes| K[Store Tokens & Redirect]
    J -->|No| L[Show Error]
```

### 3. Theme Management
```mermaid
graph TD
    A[Theme Store Init] --> B[Load Saved Theme]
    B --> C[Apply to Document]
    C --> D[User Toggle Theme]
    D --> E[Update Store State]
    E --> F[Apply CSS Classes]
    F --> G[Persist to Storage]
```

## 🎨 Theme System

The application supports three themes:

- **Super Dark**: Deep dark theme with `#060511` backgrounds
- **Dark**: Standard dark theme with CSS variables
- **Light**: Light theme with high contrast

Theme switching is handled by the `ThemeStore` and persisted across sessions.

## 🔐 Security Features

- **CSRF Protection**: Tokens retrieved and validated on each request
- **JWT Authentication**: Access tokens for API authorization
- **Route Guards**: Protected routes require authentication
- **Token Validation**: Automatic token refresh and validation

## 🚀 Deployment

### Replit Deployment (Recommended)

1. **Push to Replit**
   - Import your GitHub repository to Replit
   - Replit will automatically detect the Vue.js project

2. **Configure Run Command**
   ```bash
   npm run dev
   ```

3. **Deploy to Production**
   - Use Replit's deployment feature
   - The app will be accessible via your Replit domain

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## 📋 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔧 Configuration

### Environment Variables
Set up the following in your environment:
- API base URL is automatically set to current hostname
- CSRF tokens are retrieved dynamically

### Route Configuration
Protected routes are defined in `App.vue`:
```javascript
const authRequiredRoutes = ['config', 'user', 'upgrade'];
```

## 🐛 Troubleshooting

### Common Issues

1. **CSS Build Errors**
   - Check `tailwind.css` for syntax errors
   - Ensure proper CSS property formatting

2. **Authentication Issues**
   - Verify CSRF token endpoint is accessible
   - Check network requests in browser dev tools

3. **Theme Not Persisting**
   - Ensure localStorage is available
   - Check `persistState.js` configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is proprietary software for Enconnex EDGERACK systems.

---

For support or questions, please contact the development team.
