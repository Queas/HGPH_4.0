# HalamangGaling PH 🌿

A web application showcasing traditional Filipino herbal medicine, marine-based healing practices, and indigenous health knowledge.

## Features

- 📚 **Library System**: Browse medicinal plants, marine animals, healing practices, and traditional healers
- 🔍 **Search & Filter**: Find resources by category and keywords
- 📰 **Articles**: Educational content about traditional Filipino medicine
- 👤 **User Authentication**: Register and login system
- 🛡️ **Admin Dashboard**: Manage content and view contact messages
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- Axios for API calls
- React Context for state management
- CSS3 for styling

### Backend
- Node.js with Express
- NeDB (local file database) for development
- MongoDB support for production
- JWT authentication
- Passport.js
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd HGPh_4.0
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=8002
   NODE_ENV=development
   
   # Optional: MongoDB connection (for production)
   # MONGO_URL=your_mongodb_connection_string
   
   # Optional: Email configuration (for contact form notifications)
   # EMAIL_HOST=smtp.gmail.com
   # EMAIL_PORT=587
   # EMAIL_USER=your_email@gmail.com
   # EMAIL_PASS=your_app_password
   # EMAIL_FROM=your_email@gmail.com
   # ADMIN_EMAIL=admin@example.com
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8002
   PORT=3000
   ```

5. **Seed the Database**
   ```bash
   cd backend
   node seed-local.js
   ```

6. **Create Admin Account**
   ```bash
   node create-default-admin.js
   ```
   
   Default credentials:
   - Email: `admin@halamanggaling.ph`
   - Password: `admin123`
   
   ⚠️ **Important**: Change the default password after first login!

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on http://localhost:8002

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:3000

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/library` - Get all library items
- `GET /api/library/stats` - Get statistics by category
- `GET /api/library/:id` - Get single library item
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article
- `POST /api/contact` - Submit contact form
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Protected Endpoints (Requires Authentication)
- `POST /api/library` - Create library item (Admin only)
- `PUT /api/library/:id` - Update library item (Admin only)
- `DELETE /api/library/:id` - Delete library item (Admin only)
- `POST /api/articles` - Create article (Admin only)
- `PUT /api/articles/:id` - Update article (Admin only)
- `DELETE /api/articles/:id` - Delete article (Admin only)
- `GET /api/contact` - Get all contact messages (Admin only)
- `PUT /api/contact/:id/read` - Mark message as read (Admin only)
- `DELETE /api/contact/:id` - Delete contact message (Admin only)

## Project Structure

```
HGPh_4.0/
├── backend/
│   ├── config/          # Database and email configuration
│   ├── data/            # NeDB database files (local development)
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   │   ├── *-local.js   # NeDB routes (for local development)
│   │   └── *.js         # MongoDB routes (for production)
│   ├── server.js        # Express server setup
│   ├── seed-local.js    # Seed script for local database
│   └── create-default-admin.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # React components
│       ├── contexts/    # React Context providers
│       ├── services/    # API service layer
│       └── styles/      # CSS files
└── README.md
```

## Development Notes

- The application uses **NeDB** (local file database) for development
- For production deployment, configure MongoDB and update the routes in `server.js`
- Database files are stored in `backend/data/` and should not be committed to version control
- Always use environment variables for sensitive information

## Security Considerations

⚠️ **Before deploying to production:**
1. Change all default passwords
2. Use strong, unique JWT secrets
3. Configure CORS properly for your domain
4. Enable HTTPS
5. Set up proper email service credentials
6. Review and update all security configurations
7. Never commit `.env` files to version control

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Traditional Filipino healers and herbalists
- Department of Health (DOH) Philippines for herbal medicine research
- Philippine biodiversity research institutions

---

**Note**: This is an educational project showcasing traditional Filipino medicine. Always consult healthcare professionals for medical advice.
