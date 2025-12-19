# Dr Backfit - E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js 15, Firebase, and TypeScript.

## 🚀 Features

- **Firebase Authentication** with Email OTP and Phone OTP
- **Product Management** with Firestore and Cloudinary
- **Admin Panel** for product and user management
- **Responsive Design** with Tailwind CSS
- **Type-Safe** with TypeScript
- **Modern UI** with shadcn/ui components

## 📋 Prerequisites

- Node.js 18+ or Bun
- Firebase project with:
  - Authentication (Email/Password & Phone)
  - Firestore Database
  - Storage (for images)
- Cloudinary account (for image uploads)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drbackfitt
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase and Cloudinary credentials in `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
drbackfitt/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── auth/        # Authentication components
│   │   └── ui/          # shadcn/ui components
│   ├── context/         # React context providers
│   ├── services/        # Firebase services
│   ├── models/          # TypeScript interfaces
│   ├── lib/             # Utility functions
│   └── utils/           # Helper functions
├── public/              # Static assets
├── docs/                # Documentation
└── tests/               # Test files
```

## 🔐 Authentication

The platform supports two authentication methods:

### Email OTP
- User signs up with email and password
- Receives verification email
- Account activated after email verification

### Phone OTP
- User signs up with phone number and password
- Receives SMS with 6-digit OTP
- Account activated after OTP verification

## 📚 Documentation

- **[Firebase Setup Guide](docs/FIREBASE_SETUP_GUIDE.md)** - Configure Firebase services
- **[Auth Setup Guide](docs/AUTH_SETUP_GUIDE.md)** - Authentication implementation details
- **[Admin Setup Guide](docs/ADMIN_SETUP_GUIDE.md)** - Admin panel configuration
- **[Product Management Guide](docs/PRODUCT_MANAGEMENT_GUIDE.md)** - Managing products

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

The application is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## 🛡️ Security

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- reCAPTCHA for phone authentication
- Input validation and sanitization
- Secure session management

## 📦 Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Image Management:** Cloudinary
- **State Management:** React Context
- **Forms:** React Hook Form
- **Validation:** Zod

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For support, please contact the development team.

---

**Built with ❤️ by the Dr Backfit Team**
