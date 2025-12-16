# Logistics Pro - File Structure & Component Documentation

## Page Routes

### Authentication Pages
- **`app/signin/page.tsx`** - Sign in page with email/password form
- **`app/signup/page.tsx`** - Sign up page with validation and password strength indicator

### Dashboard Pages
- **`app/dashboard/page.tsx`** - Main dashboard with statistics and quick actions
- **`app/dashboard/new-shipment/page.tsx`** - Create new shipment form (multi-section)
- **`app/dashboard/history/page.tsx`** - View all shipments with search & filter
- **`app/dashboard/tracking/page.tsx`** - Live tracking with timeline visualization
- **`app/dashboard/details/[id]/page.tsx`** - Individual shipment details with full information

## API Routes

### Authentication
- **`app/api/auth/signup/route.ts`** - POST endpoint for user registration
- **`app/api/auth/signin/route.ts`** - POST endpoint for user login with session
- **`app/api/auth/logout/route.ts`** - POST endpoint for user logout

### Shipments
- **`app/api/shipments/route.ts`** - GET (list with filters) / POST (create) shipments
- **`app/api/shipments/[id]/route.ts`** - GET single shipment with tracking events
- **`app/api/shipments/stats/route.ts`** - GET dashboard statistics
- **`app/api/shipments/draft/route.ts`** - POST to save draft shipment

### Tracking
- **`app/api/tracking/[trackingNumber]/route.ts`** - GET tracking information by tracking number

## Components

### Base Components (UI Building Blocks)
- **`src/components/Button.tsx`**
  - Variants: primary, secondary, danger
  - Sizes: small, medium, large
  - Features: Loading state, disabled state
  
- **`src/components/Input.tsx`**
  - Features: Label, placeholder, error message, helper text
  - Focus states, disabled state
  
- **`src/components/Select.tsx`**
  - Dropdown selection with options
  - Error and helper text support
  
- **`src/components/Checkbox.tsx`**
  - Single checkbox with label
  - Focus and disabled states
  
- **`src/components/Textarea.tsx`**
  - Multi-line text input
  - Resizable with character limits
  
- **`src/components/Card.tsx`**
  - Container component with shadow and border
  - Hover effect with shadow increase
  
- **`src/components/Badge.tsx`**
  - Variants: default, success, error, warning
  - Used for status indicators
  
- **`src/components/Divider.tsx`**
  - Simple horizontal line divider

### Layout Components
- **`src/components/Header.tsx`**
  - Navigation header with logo, notifications, user menu
  - Logout button functionality
  
- **`src/components/Sidebar.tsx`**
  - Navigation menu with active state indicator
  - Menu items: Dashboard, New Shipment, History, Tracking
  - Footer with copyright info
  
- **`src/components/DashboardLayout.tsx`**
  - Wrapper for dashboard pages
  - Combines Header + Sidebar + Content
  
- **`src/components/AuthLayout.tsx`**
  - Wrapper for authentication pages
  - Centered card layout with title and subtitle

## Utility Functions

### Authentication (`src/lib/auth.ts`)
- `SignUpSchema` - Zod validation schema for signup
- `SignInSchema` - Zod validation schema for signin
- `hashPassword()` - Bcrypt password hashing
- `comparePassword()` - Password verification
- `validatePasswordStrength()` - Password strength validation with requirements

### Database (`src/lib/supabase.ts`)
- `supabase` - Initialized Supabase client
- `getCurrentUser()` - Get current authenticated user
- `signOut()` - Sign out current user

### Validation (`src/lib/validation.ts`)
- `NewShipmentSchema` - Comprehensive shipment form validation
- `LiveTrackingSchema` - Tracking number format validation

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `full_name` (VARCHAR) - User's full name
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update date

### Shipments Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `tracking_number` (VARCHAR) - Unique tracking identifier
- `pickup_location`, `pickup_address`, `pickup_city`, `pickup_postal_code` - Origin details
- `delivery_location`, `delivery_address`, `delivery_city`, `delivery_postal_code` - Destination
- `shipment_type` (VARCHAR) - standard, express, overnight
- `weight_kg` (DECIMAL) - Package weight
- `length_cm`, `width_cm`, `height_cm` (DECIMAL) - Dimensions
- `contents_description` (TEXT) - What's inside
- `insurance_required` (BOOLEAN) - Insurance flag
- `insurance_amount` (DECIMAL) - Insurance cost
- `signature_required` (BOOLEAN) - Signature requirement
- `special_handling` (VARCHAR) - fragile, perishable, hazardous, etc.
- `reference_number` (VARCHAR) - Order reference
- `special_instructions` (TEXT) - Delivery notes
- `status` (VARCHAR) - pending, confirmed, in_transit, delivered, cancelled
- `estimated_delivery_date` (DATE) - Expected delivery
- `created_at`, `updated_at` (TIMESTAMP) - Timestamps

### Tracking Events Table
- `id` (UUID) - Primary key
- `shipment_id` (UUID) - Foreign key to shipments
- `event_type` (VARCHAR) - pickup_scheduled, package_collected, in_transit, out_for_delivery, delivered
- `description` (TEXT) - Event details
- `status` (VARCHAR) - pending, completed
- `event_timestamp` (TIMESTAMP) - When the event occurred
- `created_at` (TIMESTAMP) - Record creation time

## Styling System

### Color Variables (CSS)
```css
--color-primary: #2563EB
--color-primary-dark: #1D4ED8
--color-secondary: #F97316
--color-success: #10B981
--color-error: #EF4444
--color-warning: #F59E0B
--color-dark: #1E293B
--color-light: #F8FAFC
--color-border: #E2E8F0
```

### Tailwind Classes Used
- Color utilities: bg-[#2563EB], text-[#1E293B], etc.
- Spacing: p-6, m-4, gap-4, etc.
- Typography: font-bold, text-lg, font-semibold, etc.
- Layout: grid, flex, absolute, relative
- Border: border, rounded-lg, rounded-md
- Shadow: shadow-[...], hover:shadow-lg
- Transitions: transition-colors, duration-150

## State Management

- **Local Component State**: React useState for form data
- **Session Storage**: Browser cookies for auth tokens
- **API State**: Fetch API with loading/error states
- **URL State**: Query parameters for search/filter

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=development
```

## Key Dependencies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Supabase** - PostgreSQL database and auth
- **Zod** - Schema validation
- **bcryptjs** - Password hashing
- **Lucide React** - Icon library (optional)

## Common Code Patterns

### Protected API Route
```typescript
function getUserIdFromAuth(request: NextRequest): string | null {
  const cookieStore = request.cookies;
  const authToken = cookieStore.get('auth_token')?.value;
  if (!authToken) return null;
  const decoded = JSON.parse(Buffer.from(authToken, 'base64').toString());
  return decoded.userId;
}
```

### Form Validation & Submission
```typescript
const result = FormSchema.safeParse(formData);
if (!result.success) {
  setErrors(result.error.errors);
  return;
}
// Proceed with API call
```

### Fetch Data on Mount
```typescript
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    setData(data);
  };
  fetchData();
}, []);
```

## Testing Credentials

For testing, you can create test accounts in Supabase:
- Email: test@example.com
- Password: Test@1234

## Performance Optimizations

- Dynamic imports for heavy components
- Image optimization with Next.js Image
- CSS minification with Tailwind
- Database indexes on frequently queried fields
- Session-based auth (no JWTs)
