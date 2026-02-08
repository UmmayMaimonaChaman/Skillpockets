# SkillSwap Hub - User Management System

A comprehensive skill exchange platform with full user management capabilities, built with React frontend and Node.js backend following MVC architecture.

## 🚀 Features

### Admin Features
- **Complete CRUD Operations**: Create, Read, Update, Delete users
- **User Management Dashboard**: Modern interface with statistics
- **User Banning/Unbanning**: Toggle user account status
- **Role Management**: Assign admin or user roles
- **Real-time Statistics**: View total users, admins, banned users, etc.

### User Features
- **User Authentication**: Sign up, sign in, logout
- **Profile Management**: Edit profile information and change password
- **User Dashboard**: Personal dashboard with quick actions
- **Skill Management**: Create, view, and manage skills
- **Request Management**: Handle skill exchange requests
- **Session Tracking**: Monitor learning sessions

## 👥 User Accounts

### Admin Account
- **Email**: `chamanmaimona@gmail.com`
- **Password**: `Chaman@5204`
- **Name**: Ummay Maimona Chaman
- **Role**: Admin

### Regular User Accounts
1. **Nazifa Prova**
   - Email: `nazifaprova@gmail.com`
   - Password: `PROVAtoxic`

2. **Taznia Onon**
   - Email: `tazniaonon@gmail.com`
   - Password: `ONONgoru`

3. **Rizve Ahmed**
   - Email: `rizveahmed@gmail.com`
   - Password: `RIZVEgondar`

4. **Jubaida**
   - Email: `jubaida@gmail.com`
   - Password: `JUBAIDAcat`

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── controllers/
│   ├── adminController.js      # Admin CRUD operations
│   ├── adminAuthController.js  # Admin authentication
│   ├── authController.js       # User authentication
│   └── userController.js       # User operations
├── middleware/
│   ├── auth.js                 # JWT authentication
│   └── admin.js                # Admin authorization
├── models/
│   └── User.js                 # User data model
├── routes/
│   ├── admin.js                # Admin API routes
│   ├── adminAuth.js            # Admin auth routes
│   ├── auth.js                 # User auth routes
│   └── user.js                 # User API routes
└── scripts/
    ├── createAdminUser.js      # Admin user creation
    └── createUsers.js          # Regular users creation
```

### Frontend (React)
```
frontend/src/
├── pages/
│   ├── AdminDashboard.js       # Admin management interface
│   ├── AdminLogin.js           # Admin login page
│   ├── UserDashboard.js        # User dashboard
│   ├── Login.js                # User login
│   └── Register.js             # User registration
├── components/
│   └── Navbar.js               # Navigation component
└── App.js                      # Main application router
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_jwt_secret_key_here
PORT=5001
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Database Setup
```bash
# Create admin user
cd backend
node scripts/createAdminUser.js

# Create regular users
node scripts/createUsers.js
```

### Running the Application
```bash
# Start backend server
cd backend
npm start

# Start frontend (in new terminal)
cd frontend
npm start
```

## 🔐 Authentication & Authorization

### JWT Token System
- Tokens expire after 7 days
- Admin tokens include `isAdmin: true` flag
- User tokens include role information

### Middleware Protection
- `auth.js`: Protects routes requiring authentication
- `admin.js`: Protects admin-only routes

## 📊 API Endpoints

### Admin Routes
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get specific user
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/toggle-ban` - Ban/unban user

### User Routes
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin-auth/login` - Admin login

## 🎨 UI/UX Features

### Admin Dashboard
- Modern gradient design
- Responsive statistics cards
- Interactive user table
- Modal forms for CRUD operations
- Real-time status indicators

### User Dashboard
- Clean profile display
- Editable profile form
- Quick action cards
- Password change functionality
- Status indicators

### Navigation
- Dynamic navigation based on user role
- Responsive mobile menu
- Role-based access control

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation
- XSS protection
- CORS configuration

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interfaces
- Adaptive navigation

## 🚀 Getting Started

1. **Clone the repository**
2. **Set up the database and environment variables**
3. **Run the setup scripts to create users**
4. **Start both backend and frontend servers**
5. **Access the application at `http://localhost:3000`**

### Admin Access
- Navigate to `/admin/login`
- Use admin credentials to access the dashboard

### User Access
- Navigate to `/login` or `/register`
- Use any of the provided user credentials

## 🤝 Contributing

This system follows MVC architecture and best practices for:
- Code organization
- Security implementation
- User experience design
- API design patterns

## 📄 License

This project is created for educational and demonstration purposes.