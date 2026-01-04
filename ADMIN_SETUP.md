# Admin System Setup Guide

This guide explains how to set up and use the admin system for the Logistics Webapp.

## Database Setup

1. **Run the migration script** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of admin_migration.sql
   ```

2. **Alternative: Manual setup**
   If you prefer to set up manually, run these commands in your Supabase SQL editor:

   ```sql
   -- Create users table with role management
   CREATE TABLE IF NOT EXISTS public.users (
     id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
     email text UNIQUE NOT NULL,
     full_name text,
     role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now(),
     last_sign_in_at timestamptz
   );

   -- Create indexes
   CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
   CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

   -- Enable RLS
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   CREATE POLICY "users_select_own" ON public.users
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "users_select_admin" ON public.users
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.users u
         WHERE u.id = auth.uid() AND u.role = 'admin'
       )
     );

   CREATE POLICY "users_update_own" ON public.users
     FOR UPDATE USING (auth.uid() = id)
     WITH CHECK (auth.uid() = id);

   CREATE POLICY "users_update_admin" ON public.users
     FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM public.users u
         WHERE u.id = auth.uid() AND u.role = 'admin'
       )
     );

   CREATE POLICY "users_insert_admin" ON public.users
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM public.users u
         WHERE u.id = auth.uid() AND u.role = 'admin'
       )
     );

   -- Function to create user profile on signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.users (id, email, full_name, role)
     VALUES (
       NEW.id,
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
       CASE
         WHEN NEW.email = 'admin@logistics.com' THEN 'admin'
         ELSE 'user'
       END
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Trigger to create user profile on signup
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

   -- Grant permissions
   GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
   GRANT USAGE ON SCHEMA public TO authenticated;
   ```

## Creating Admin Users

### Method 1: Automatic Assignment
The following emails are automatically assigned admin role on signup:
- `admin@logistics.com` (default admin)
- `officialsunnyugwu@gmail.com` (your admin account)

### Method 2: Manual Assignment via Admin Panel
After a user signs up, an existing admin can change their role:

1. Go to Admin Panel → User Management
2. Find the user in the table
3. Use the dropdown in the "Actions" column to change their role from "User" to "Admin"

## Admin Features

### Dashboard (`/superAdmin/dashboard`)
- Overview statistics (total shipments, active shipments, users, admins)
- Recent shipments list
- Quick access to all admin functions

### Shipment Management (Dashboard section)
- View all shipments across the platform
- Search and filter by tracking number or status
- Update shipment statuses in real-time
- Pagination for large datasets

### User Management (`/superAdmin/users`)
- View all registered users
- Search by email or name
- Change user roles (User ↔ Admin)
- View user statistics (shipment counts, last sign-in)

### Analytics (`/superAdmin/analytics`)
- Shipment trends over the last 7 days
- Status distribution charts
- Popular shipping routes
- Platform usage insights

### Settings (`/superAdmin/settings`)
- Configure company information
- Set default delivery parameters
- Enable/disable notifications
- Maintenance mode toggle

## Automatic Routing

Routing is handled by the Next.js proxy logic:

- `/admin/*` routes redirect/wrap to `/superAdmin/*` (for backwards compatibility)

- **Admin/SuperAdmin users** are redirected from `/dashboard` to `/superAdmin/dashboard`
- **Regular users** are blocked from accessing `/admin/*` and `/superAdmin/*` routes
- **Unauthenticated users** are redirected to sign-in when accessing protected routes

## API Endpoints

All admin API endpoints require authentication and admin role:

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/shipments` - List shipments with pagination
- `PATCH /api/admin/shipments/[id]` - Update shipment status
- `GET /api/admin/users` - List users with pagination
- `PATCH /api/admin/users/[id]` - Update user role
- `GET /api/admin/analytics` - Analytics data

## Security Features

- **Role-based access control** at API and UI levels
- **Row Level Security (RLS)** policies in the database
- **Automatic redirects** prevent unauthorized access
- **Admin-only operations** are protected server-side

## Navigation

Admin users will see an "Admin Panel" link in their sidebar navigation. Regular users won't see this option.

## Testing the Admin System

1. Sign up with `officialsunnyugwu@gmail.com` to create an admin account (this email is automatically assigned admin role)
2. Sign in and verify you're redirected to `/superAdmin/dashboard` (or that `/admin/dashboard` forwards to it)
3. Test all admin features
4. Create a regular user account to verify they can't access admin routes
5. Test the admin panel link appears only for admin users

## Troubleshooting

### Admin user not recognized
- Ensure the user exists in the `users` table with `role = 'admin'`
- Check that the middleware is running correctly

### API access denied
- Verify the user is authenticated
- Check the user's role in the database
- Ensure RLS policies are correctly applied

### Routing issues
- Clear browser cache and cookies
- Check proxy.ts routing logic
- Verify Next.js configuration