# Dr Backfit Atelier - Premium Handcrafted Furniture

A Next.js e-commerce application for premium handcrafted furniture.

## Features

- Browse furniture catalog with filtering and sorting
- Shopping cart functionality
- Custom order requests
- Responsive design with Tailwind CSS
- Modern UI components with Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Firebase Configuration

This project now relies on Firebase for product, review, and media data. Create a `.env.local` file with the following variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=optional-measurement-id

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-app.appspot.com
```

> The `FIREBASE_PRIVATE_KEY` must retain newline characters. Wrap it in quotes and replace literal `\n` with real newlines or escape sequences (`\\n`) depending on your deployment platform.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context
- **Forms**: React Hook Form
- **Notifications**: Sonner

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── data/             # Static data
├── public/               # Static assets
└── ...config files
```

## License

All rights reserved.
