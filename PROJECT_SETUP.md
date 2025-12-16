# Logistics Pro - Shipment Management System

A modern, professional logistics and shipment tracking web application built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Secure sign-up and sign-in with password validation
- **Dashboard**: Overview of all shipments with quick statistics
- **New Shipment Creation**: Comprehensive form to create and submit shipments with validation
- **Logistic History**: View all your shipments with search and filter capabilities
- **Live Tracking**: Real-time shipment tracking with event timeline
- **Responsive Design**: Mobile-first design following modern UI/UX best practices
- **Design System**: Full implementation of the custom design specification

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Package Manager**: Yarn
- **Authentication**: Session-based with bcrypt password hashing
- **Form Validation**: Zod schema validation

## Project Structure

```
logistics/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts          # User registration
│   │   │   ├── signin/route.ts          # User login
│   │   │   └── logout/route.ts          # User logout
│   │   ├── shipments/
│   │   │   ├── route.ts                 # Get/Create shipments
│   │   │   ├── [id]/route.ts            # Get single shipment
│   │   │   ├── stats/route.ts           # Dashboard statistics
│   │   │   └── draft/route.ts           # Save draft shipment
│   │   └── tracking/
│   │       └── [trackingNumber]/route.ts # Track shipment
│   ├── signin/page.tsx                  # Sign in page
│   ├── signup/page.tsx                  # Sign up page
│   ├── dashboard/
│   │   ├── page.tsx                     # Dashboard home
│   │   ├── new-shipment/page.tsx        # Create shipment form
│   │   ├── history/page.tsx             # Shipment history
│   │   ├── tracking/page.tsx            # Live tracking
│   │   └── details/[id]/page.tsx        # Shipment details
│   ├── globals.css                      # Global styles & design tokens
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Root redirect to signin
├── src/
│   ├── components/
│   │   ├── Button.tsx                   # Button component
│   │   ├── Input.tsx                    # Input field component
│   │   ├── Card.tsx                     # Card component
│   │   ├── Select.tsx                   # Select dropdown component
│   │   ├── Checkbox.tsx                 # Checkbox component
│   │   ├── Textarea.tsx                 # Textarea component
│   │   ├── Badge.tsx                    # Badge/Tag component
│   │   ├── Divider.tsx                  # Divider component
│   │   ├── Header.tsx                   # Page header
│   │   ├── Sidebar.tsx                  # Navigation sidebar
│   │   ├── DashboardLayout.tsx          # Dashboard layout wrapper
│   │   └── AuthLayout.tsx               # Auth page layout wrapper
│   └── lib/
│       ├── supabase.ts                  # Supabase client config
│       ├── auth.ts                      # Authentication utilities
│       └── validation.ts                # Form validation schemas
├── db/
│   └── schema.sql                       # Database schema
├── public/                              # Static assets
├── .env.local.example                   # Environment variables template
├── next.config.ts                       # Next.js configuration
├── postcss.config.mjs                   # PostCSS configuration
├── tailwind.config.ts                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Project dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API Keys
3. Copy your `Project URL` and `Anon Key`
4. Also create a Service Role Key from the same page

### 3. Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 4. Set Up Database

1. In Supabase, go to SQL Editor
2. Create a new query and copy the contents of `db/schema.sql`
3. Run the SQL to create all tables and indexes

### 5. Run the Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## User Flow

### Sign Up
1. Navigate to `/signup`
2. Enter full name, email, and password
3. Confirm password and agree to terms
4. Account will be created and redirected to sign in

### Sign In
1. Navigate to `/signin`
2. Enter email and password
3. Optional: Check "Remember me" to stay logged in longer
4. Redirected to dashboard on successful login

### Create Shipment
1. From dashboard, click "New Shipment" or navigate to `/dashboard/new-shipment`
2. Fill in shipment details:
   - **Origin**: Pickup location, address, city, postal code
   - **Destination**: Delivery location, address, city, postal code
   - **Details**: Shipment type, weight, dimensions, contents
   - **Options**: Insurance, signature, special handling
   - **Additional**: Reference number, special instructions
3. Review and submit
4. Shipment created with auto-generated tracking number

### View History
1. Navigate to `/dashboard/history`
2. View all shipments in a table format
3. Search by tracking number or location
4. Filter by status (pending, confirmed, in transit, delivered, cancelled)
5. Click "View Details" to see full shipment information

### Track Shipment
1. Navigate to `/dashboard/tracking`
2. Enter tracking number (format: SHP-XXXX-XXXXXX)
3. View real-time tracking with timeline of events
4. See estimated delivery date and route map

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in existing user
- `POST /api/auth/logout` - Sign out user

### Shipments
- `GET /api/shipments` - Get all user shipments (with search/filter)
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/[id]` - Get single shipment details
- `GET /api/shipments/stats` - Get dashboard statistics
- `POST /api/shipments/draft` - Save shipment draft

### Tracking
- `GET /api/tracking/[trackingNumber]` - Get tracking information

## Design System

All components follow the design specifications defined in `DESIGN_SPECIFICATIONS.md`:

### Color Palette
- Primary Blue: `#2563EB`
- Primary Orange: `#F97316`
- Dark Slate: `#1E293B`
- Success Green: `#10B981`
- Error Red: `#EF4444`
- Warning Yellow: `#F59E0B`

### Typography
- Font: Inter, Segoe UI
- Headings: Bold (700) with letter spacing
- Body: Regular (400), 14px, line-height 20px
- Monospace: Fira Code, Monaco

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

## Form Validation

### Sign Up Validation
- Full name: Min 2 characters
- Email: Valid email format
- Password: Min 8 characters, 1 uppercase, 1 number, 1 special character
- Terms: Must agree to terms of service

### New Shipment Validation
- Required fields: All location fields, shipment type, weight
- Weight: Must be positive number
- Tracking number format validation on tracking page

## Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (2-3 columns)

## Development Tips

### Adding New Components
1. Create component in `src/components/`
2. Export from component file
3. Use in pages with proper TypeScript types
4. Follow design spec for styling

### Adding New Pages
1. Create page in appropriate `app/` directory
2. Use layout components for consistent structure
3. Implement proper error handling
4. Add loading states

### Database Changes
1. Update `db/schema.sql` with new schema
2. Run migration in Supabase SQL Editor
3. Update TypeScript types in components/pages

## Building for Production

```bash
yarn build
yarn start
```

## Troubleshooting

### Database Connection Issues
- Verify Supabase environment variables
- Check internet connection
- Ensure Supabase project is active

### Authentication Issues
- Clear browser cookies
- Check if session token is valid
- Verify user exists in database

### Styling Issues
- Clear `.next` folder: `rm -rf .next`
- Rebuild project: `yarn build`
- Check Tailwind CSS configuration

## License

This project is proprietary and confidential.
