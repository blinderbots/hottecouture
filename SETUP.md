# Hotte Couture - Setup and Run Guide

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** for database and authentication

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Pricing Configuration
RUSH_FEE_SMALL_CENTS=3000
RUSH_FEE_LARGE_CENTS=6000
GST_PST_RATE_BPS=1200

# Optional: Custom configuration
CUSTOM_KEY=your_custom_key
```

### 3. Database Setup

#### Run Database Migrations

```bash
# If you have Supabase CLI installed
supabase db reset

# Or manually run the SQL migrations in your Supabase dashboard:
# 1. Go to your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Run the migration files in order:
#    - supabase/migrations/0001_init.sql
#    - supabase/migrations/0002_rls_policies.sql
```

#### Create Storage Buckets

Run the storage setup script in your Supabase SQL Editor:

```sql
-- Run the contents of supabase/scripts/setup-storage.sql
-- This creates the required storage buckets: photos, labels, receipts, docs
```

### 4. Development Server

```bash
# Start the development server
npm run dev

# Or using yarn
yarn dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
```

### Testing
```bash
npm run test         # Run unit tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests with Playwright
npm run test:e2e:ui  # Run E2E tests with UI
```

### Type Checking
```bash
npm run typecheck    # Run TypeScript type checking
```

## Application Structure

### Key Pages
- **`/`** - Homepage
- **`/intake`** - Order intake form (5-step process)
- **`/board`** - Kanban board for order management
- **`/status`** - Order status lookup (phone + last name)
- **`/auth/sign-in`** - Authentication page
- **`/dashboard`** - Main dashboard

### API Endpoints
- **`POST /api/intake`** - Create new orders
- **`POST /api/labels/:orderId`** - Generate label PDFs
- **`GET /api/order/search`** - Search orders by phone/last name
- **`POST /api/task/:id/start`** - Start task tracking
- **`POST /api/task/:id/stop`** - Stop task tracking

## Features Overview

### 1. Order Intake (`/intake`)
- Multi-step form with client, garments, services, notes, pricing
- Camera capture for garment photos
- Real-time pricing calculation
- QR code generation
- Automatic receipt generation

### 2. Kanban Board (`/board`)
- Drag-and-drop order management
- Real-time updates via Supabase
- Filtering by rush, due date, assignee, pipeline
- Stage transition logic

### 3. Order Status (`/status`)
- Client-friendly order lookup
- Phone + last name search
- Order progress display
- Print labels integration

### 4. Label Generation
- QR code generation for orders and garments
- PDF label sheets with A4/Letter support
- Print-optimized CSS
- Storage integration

### 5. Internationalization
- French (default) and English support
- Language toggle component
- Localized templates and receipts
- Proper date/currency formatting

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Issues
```bash
# Check your environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify Supabase project is active
# Check Supabase dashboard for project status
```

#### 2. Database Migration Errors
```bash
# Reset database if needed
supabase db reset

# Or manually check migration files
# Ensure all tables are created properly
```

#### 3. Storage Bucket Issues
```bash
# Verify storage buckets exist
# Check Supabase Storage dashboard
# Ensure proper RLS policies are set
```

#### 4. PDF Generation Issues
```bash
# Check Puppeteer installation
npm list puppeteer

# On some systems, you may need to install additional dependencies
# For Ubuntu/Debian:
sudo apt-get install -y libnss3-dev libatk-bridge2.0-dev libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2

# For macOS:
brew install --cask chromium
```

### Development Tips

#### 1. Hot Reloading
The development server supports hot reloading for:
- React components
- CSS changes
- TypeScript files
- API routes

#### 2. Database Seeding
For development, you can seed the database with sample data:

```sql
-- Insert sample services
INSERT INTO service (code, name, base_price_cents, category, is_custom) VALUES
('HEM', 'Hemming', 1500, 'alteration', false),
('TAKE_IN', 'Take In', 2500, 'alteration', false),
('LET_OUT', 'Let Out', 3000, 'alteration', false),
('CUSTOM', 'Custom Work', 0, 'custom', true);
```

#### 3. Testing
```bash
# Run specific test files
npm run test src/lib/pricing/calcTotal.test.ts

# Run tests with coverage
npm run test -- --coverage

# Run E2E tests for specific pages
npm run test:e2e -- --grep "intake"
```

## Production Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   Set all environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RUSH_FEE_SMALL_CENTS`
   - `RUSH_FEE_LARGE_CENTS`
   - `GST_PST_RATE_BPS`

3. **Build Configuration**
   The application is already configured for Vercel with:
   - Automatic builds on push
   - Preview deployments for PRs
   - Production builds for main branch

### Other Platforms

For other deployment platforms, ensure:
- Node.js 18+ runtime
- Environment variables are set
- Build command: `npm run build`
- Start command: `npm run start`

## Support

If you encounter issues:

1. **Check the logs** in your terminal
2. **Verify environment variables** are set correctly
3. **Check Supabase dashboard** for database/storage issues
4. **Review the error messages** for specific guidance
5. **Check the GitHub issues** for known problems

## Next Steps

Once running, you can:

1. **Create test orders** via the intake form
2. **Manage orders** on the Kanban board
3. **Generate labels** for orders
4. **Test the status lookup** functionality
5. **Switch languages** using the toggle
6. **Customize the application** for your specific needs

The application is production-ready with comprehensive features for order management, label generation, and client communication!
