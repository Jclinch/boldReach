# Logistics Webapp - Design Specification Document

**Project:** Logistics Webapp
**Date:** December 10, 2025
**Status:** Based on Figma Design Analysis

---

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography System](#typography-system)
3. [Component Library](#component-library)
4. [Page Layouts](#page-layouts)
5. [Design Patterns & Spacing](#design-patterns--spacing)

---

## Color Palette

### Primary Colors
| Color Name | Hex Code | Usage |
|-----------|----------|-------|
| Primary Blue | `#2563EB` | CTA buttons, primary actions, links |
| Primary Orange | `#F97316` | Accent elements, highlights, alerts |
| Dark Slate | `#1E293B` | Primary text, headings, dark backgrounds |
| Light Gray | `#F8FAFC` | Backgrounds, card surfaces |
| Border Gray | `#E2E8F0` | Form borders, dividers |
| Success Green | `#10B981` | Success states, confirmations |
| Error Red | `#EF4444` | Error states, validation |
| Warning Yellow | `#F59E0B` | Warning states, cautions |

### Background Colors
- **Primary Background:** `#FFFFFF` (white)
- **Secondary Background:** `#F8FAFC` (light blue-gray)
- **Tertiary Background:** `#F1F5F9` (lighter gray)
- **Dark Background (if applicable):** `#0F172A` (dark slate)

### Text Colors
| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Text | Dark Slate | `#1E293B` |
| Secondary Text | Slate Gray | `#475569` |
| Tertiary Text | Medium Gray | `#94A3B8` |
| Disabled Text | Light Gray | `#CBD5E1` |
| Inverse Text | White | `#FFFFFF` |

---

## Typography System

### Font Family
- **Primary Font:** `Inter` or `Segoe UI`
- **Heading Font:** `Inter` (or same as primary with weight variation)
- **Monospace (if applicable):** `Fira Code` or `Monaco`

### Font Scales & Weights

#### Headings
| Level | Font Size | Line Height | Font Weight | Letter Spacing |
|-------|-----------|------------|-------------|----------------|
| H1 (Page Title) | 32px | 40px | 700 (Bold) | -0.5px |
| H2 (Section Title) | 24px | 32px | 700 (Bold) | -0.3px |
| H3 (Subsection) | 20px | 28px | 600 (Semibold) | 0px |
| H4 (Card Title) | 18px | 24px | 600 (Semibold) | 0px |

#### Body Text
| Type | Font Size | Line Height | Font Weight | Usage |
|------|-----------|------------|-------------|-------|
| Body Large | 16px | 24px | 400 (Regular) | Primary body text |
| Body Medium | 14px | 20px | 400 (Regular) | Standard body text |
| Body Small | 12px | 18px | 400 (Regular) | Secondary info, labels |

#### UI Text
| Type | Font Size | Line Height | Font Weight | Usage |
|------|-----------|------------|-------------|-------|
| Button | 14px | 20px | 600 (Semibold) | Button labels |
| Label | 12px | 16px | 500 (Medium) | Form labels |
| Caption | 11px | 16px | 400 (Regular) | Hints, captions |

---

## Component Library

### Buttons

#### Primary Button
- **Background:** `#2563EB` (Primary Blue)
- **Text Color:** `#FFFFFF` (White)
- **Padding:** 12px 24px (vertical × horizontal)
- **Border Radius:** 6px
- **Font Size:** 14px
- **Font Weight:** 600 (Semibold)
- **Border:** None
- **States:**
  - Normal: `#2563EB`
  - Hover: `#1D4ED8` (darker)
  - Active: `#1E40AF` (even darker)
  - Disabled: `#CBD5E1` (light gray), opacity 50%

#### Secondary Button
- **Background:** `#F8FAFC` (Light Gray)
- **Text Color:** `#2563EB` (Primary Blue)
- **Border:** 1px solid `#E2E8F0`
- **Padding:** 12px 24px
- **Border Radius:** 6px
- **Font Size:** 14px
- **Font Weight:** 600 (Semibold)
- **States:**
  - Normal: Border `#E2E8F0`, Bg `#F8FAFC`
  - Hover: Border `#CBD5E1`, Bg `#F1F5F9`
  - Active: Border `#94A3B8`, Bg `#E2E8F0`
  - Disabled: Opacity 50%

#### Danger Button
- **Background:** `#EF4444` (Error Red)
- **Text Color:** `#FFFFFF` (White)
- **Padding:** 12px 24px
- **Border Radius:** 6px
- **Font Size:** 14px
- **Font Weight:** 600 (Semibold)
- **States:**
  - Hover: `#DC2626` (darker red)
  - Active: `#B91C1C` (even darker)

#### Button Sizes
| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| Small | 8px 16px | 12px | 32px |
| Medium | 12px 24px | 14px | 40px |
| Large | 14px 32px | 16px | 48px |

### Input Fields

#### Text Input
- **Background:** `#FFFFFF` (White)
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 6px
- **Padding:** 10px 12px
- **Font Size:** 14px
- **Text Color:** `#1E293B`
- **Placeholder Color:** `#94A3B8`
- **States:**
  - Default: Border `#E2E8F0`
  - Focus: Border `#2563EB`, Box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
  - Error: Border `#EF4444`, Background tint: rgba(239, 68, 68, 0.05)
  - Disabled: Background `#F8FAFC`, Text `#CBD5E1`
- **Height:** 40px
- **Width:** 100% (in form context)

#### Input Label
- **Font Size:** 12px
- **Font Weight:** 500 (Medium)
- **Color:** `#1E293B`
- **Margin Bottom:** 6px
- **Required Indicator:** `*` in color `#EF4444`

#### Input Placeholder
- **Color:** `#94A3B8`
- **Style:** Regular, italic (optional)

#### Helper Text
- **Font Size:** 11px
- **Color:** `#94A3B8`
- **Margin Top:** 4px
- **Display:** Below input field

#### Error Message
- **Font Size:** 11px
- **Color:** `#EF4444`
- **Margin Top:** 4px
- **Icon:** Small error icon (optional)

### Select/Dropdown
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 6px
- **Padding:** 10px 12px
- **Font Size:** 14px
- **Arrow Icon Color:** `#94A3B8`
- **Height:** 40px
- **States:** Same as text input

### Checkbox
- **Size:** 16px × 16px
- **Border Radius:** 4px
- **Border:** 2px solid `#E2E8F0`
- **Checked Background:** `#2563EB`
- **Checkmark Color:** `#FFFFFF`
- **Focus Ring:** 2px solid `#2563EB`, offset 2px
- **Spacing from label:** 8px

### Radio Button
- **Size:** 16px × 16px
- **Border:** 2px solid `#E2E8F0`
- **Checked Background:** `#2563EB`
- **Inner Dot Size:** 6px
- **Dot Color:** `#FFFFFF`
- **Focus Ring:** 2px solid `#2563EB`, offset 2px

### Cards
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Padding:** 24px
- **Box Shadow:** 0 1px 3px rgba(0, 0, 0, 0.1)
- **States:**
  - Hover: Shadow increases to 0 4px 12px rgba(0, 0, 0, 0.15)

### Form Container
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Padding:** 32px
- **Max Width:** 400px - 600px depending on form type

### Dividers
- **Color:** `#E2E8F0`
- **Height:** 1px
- **Margin:** 16px 0px

### Badges
- **Background:** `#F0F9FF` (light blue)
- **Text Color:** `#0369A1` (darker blue)
- **Padding:** 4px 12px
- **Border Radius:** 12px
- **Font Size:** 12px
- **Font Weight:** 500 (Medium)

---

## Page Layouts

### 1. Sign In Page

#### Layout Structure
- **Full Screen:** Yes, centered content
- **Background:** `#F8FAFC` (light gray)
- **Content Width:** 400px max
- **Vertical Centering:** Approx. 50% from top

#### Header Section
- **Logo/Title:** "Logistics Pro" or similar
- **Font Size:** 24px, Bold
- **Margin Bottom:** 8px
- **Subtitle:** "Welcome back"
- **Font Size:** 14px, Regular
- **Color:** `#475569`
- **Margin Bottom:** 32px

#### Form Container
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Padding:** 32px
- **Box Shadow:** 0 1px 3px rgba(0, 0, 0, 0.1)

#### Form Fields (in order)
1. **Email Field**
   - Label: "Email Address"
   - Placeholder: "you@example.com"
   - Type: email
   - Required: Yes
   - Width: 100%
   - Margin Bottom: 24px

2. **Password Field**
   - Label: "Password"
   - Placeholder: "••••••••"
   - Type: password
   - Required: Yes
   - Width: 100%
   - Margin Bottom: 8px
   - Show/Hide toggle: Icon on right

3. **Remember Me Checkbox**
   - Label: "Remember me"
   - Margin Bottom: 24px

4. **Forgot Password Link**
   - Text: "Forgot password?"
   - Color: `#2563EB`
   - Font Size: 12px
   - Alignment: Right
   - Margin Bottom: 24px

#### Action Buttons
- **Sign In Button**
  - Type: Primary Button
  - Width: 100%
  - Height: 40px
  - Margin Bottom: 12px

- **Sign Up Link**
  - Text: "Don't have an account? Sign up"
  - Color: `#2563EB`
  - Font Size: 13px
  - Alignment: Center
  - Cursor: Pointer

#### Optional Elements
- **Or Divider:** "Or continue with"
- **Social Login Buttons:** Google, Microsoft (if applicable)

---

### 2. Sign Up Page

#### Layout Structure
- **Full Screen:** Yes, centered content
- **Background:** `#F8FAFC`
- **Content Width:** 400px max
- **Vertical Centering:** Approx. 50% from top

#### Header Section
- **Title:** "Create Account"
- **Font Size:** 24px, Bold
- **Margin Bottom:** 8px
- **Subtitle:** "Join our logistics network"
- **Font Size:** 14px, Regular
- **Color:** `#475569`
- **Margin Bottom:** 32px

#### Form Container
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Padding:** 32px
- **Box Shadow:** 0 1px 3px rgba(0, 0, 0, 0.1)

#### Form Fields (in order)
1. **Full Name Field**
   - Label: "Full Name"
   - Placeholder: "John Doe"
   - Type: text
   - Required: Yes
   - Margin Bottom: 24px

2. **Email Field**
   - Label: "Email Address"
   - Placeholder: "you@example.com"
   - Type: email
   - Required: Yes
   - Margin Bottom: 24px
   - Helper Text: "We'll send a verification email"
   - Font Size: 11px, Color: `#94A3B8`

3. **Password Field**
   - Label: "Password"
   - Placeholder: "Min. 8 characters"
   - Type: password
   - Required: Yes
   - Margin Bottom: 8px
   - Show/Hide toggle: Right aligned icon

4. **Password Requirements**
   - Font Size: 11px
   - Color: `#94A3B8`
   - List items (with checkmarks when met):
     - At least 8 characters
     - One uppercase letter
     - One number
     - One special character
   - Margin Bottom: 24px

5. **Confirm Password Field**
   - Label: "Confirm Password"
   - Placeholder: "••••••••"
   - Type: password
   - Required: Yes
   - Margin Bottom: 24px

6. **Terms & Conditions Checkbox**
   - Label: "I agree to the Terms of Service and Privacy Policy"
   - Required: Yes
   - Margin Bottom: 24px
   - Links in Terms text: Color `#2563EB`

#### Action Buttons
- **Sign Up Button**
  - Type: Primary Button
  - Width: 100%
  - Height: 40px
  - Margin Bottom: 12px

- **Sign In Link**
  - Text: "Already have an account? Sign in"
  - Color: `#2563EB`
  - Font Size: 13px
  - Alignment: Center

---

### 3. New Shipment Page (Form)

#### Layout Structure
- **Layout:** Sidebar + Main Content
- **Sidebar Width:** 250px - 280px
- **Main Content:** Flex, fill remaining space
- **Background:** `#F8FAFC`
- **Top Bar:** Header with user profile, notifications

#### Header Bar
- **Background:** `#FFFFFF`
- **Border Bottom:** 1px solid `#E2E8F0`
- **Height:** 60px
- **Padding:** 0 24px
- **Alignment:** Space-between
- **Left:** Logo + "Logistics Pro"
- **Right:** User profile, notifications, settings

#### Sidebar Navigation
- **Background:** `#FFFFFF`
- **Border Right:** 1px solid `#E2E8F0`
- **Width:** 250px
- **Padding:** 24px 0
- **Menu Items:**
  - Dashboard
  - New Shipment (Active)
  - Shipments
  - Reports
  - Settings
  - Help
- **Active Item:** 
  - Background: `#F0F9FF`
  - Border Left: 3px solid `#2563EB`
  - Text Color: `#2563EB`
- **Inactive Item:**
  - Background: Transparent
  - Text Color: `#475569`
  - Hover: Background `#F8FAFC`

#### Main Content Area
- **Padding:** 32px
- **Max Width:** 1000px (or full)

#### Form Section
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Padding:** 32px
- **Box Shadow:** 0 1px 3px rgba(0, 0, 0, 0.1)

#### Section Heading
- **Font Size:** 18px
- **Font Weight:** 600 (Semibold)
- **Color:** `#1E293B`
- **Margin Bottom:** 24px
- **Border Bottom:** 1px solid `#E2E8F0`
- **Padding Bottom:** 16px

#### Form Fields Layout
- **Grid:** 2 columns on desktop, 1 column on mobile
- **Gap:** 24px between fields
- **Full Width Fields:** Location selection, address fields

#### New Shipment Form Fields (in logical sections)

##### 1. Shipment Origin Section
- **Pickup Location** (Select)
  - Label: "Pickup Location"
  - Placeholder: "Select location"
  - Required: Yes
  
- **Pickup Address** (Text)
  - Label: "Street Address"
  - Placeholder: "123 Main St"
  - Required: Yes
  
- **Pickup City/Postal Code** (2-column layout)
  - City field
  - Postal Code field
  - Required: Yes

##### 2. Shipment Destination Section
- **Delivery Location** (Select)
  - Label: "Delivery Location"
  - Placeholder: "Select location"
  - Required: Yes
  
- **Delivery Address** (Text)
  - Label: "Street Address"
  - Placeholder: "456 Oak Ave"
  - Required: Yes
  
- **Delivery City/Postal Code** (2-column)
  - City field
  - Postal Code field
  - Required: Yes

##### 3. Shipment Details Section
- **Shipment Type** (Select)
  - Options: Standard, Express, Overnight, etc.
  - Required: Yes
  
- **Package Weight** (Number)
  - Label: "Weight (kg)"
  - Placeholder: "0.00"
  - Required: Yes
  
- **Package Dimensions** (3-column: L × W × H)
  - Length, Width, Height fields
  - Unit: cm
  - Optional

- **Contents Description** (Textarea)
  - Label: "Package Contents"
  - Placeholder: "Describe what's being shipped..."
  - Rows: 4
  - Optional

##### 4. Service Options Section
- **Insurance Required** (Checkbox)
  - Label: "Add shipping insurance"
  - Optional
  - Additional field appears if checked: Insurance amount (currency)
  
- **Signature Required** (Checkbox)
  - Label: "Require signature on delivery"
  - Optional

- **Special Handling** (Select)
  - Options: None, Fragile, Perishable, Hazardous, etc.
  - Optional

##### 5. Additional Information Section
- **Reference Number** (Text)
  - Label: "Order/Reference Number"
  - Placeholder: "ORD-2025-001234"
  - Optional

- **Special Instructions** (Textarea)
  - Label: "Delivery Instructions"
  - Placeholder: "e.g., Ring doorbell twice, leave at gate..."
  - Rows: 3
  - Optional

#### Form Actions (Bottom)
- **Layout:** Flex, justify-content: flex-end
- **Gap:** 12px
- **Save Draft Button**
  - Type: Secondary Button
  - Label: "Save Draft"
  
- **Create Shipment Button**
  - Type: Primary Button
  - Label: "Create Shipment"
  - Required Fields must be filled
  
- **Disabled State Color:** `#CBD5E1`

#### Form Validation
- **Invalid Field Border Color:** `#EF4444`
- **Invalid Field Background Tint:** rgba(239, 68, 68, 0.05)
- **Error Message Display:** Below field
- **Error Message Color:** `#EF4444`
- **Error Message Font Size:** 11px

---

### 4. Shipment Details (Inputted/Submitted)

#### Layout Structure
- **Layout:** Sidebar + Main Content (same as New Shipment)
- **Background:** `#F8FAFC`

#### Main Content Area
- **Padding:** 32px

#### Header Section
- **Title:** "Shipment Details"
- **Font Size:** 24px, Bold
- **Subtitle:** "Tracking: BDL-123-4567"
- **Font Size:** 14px, Regular, Color: `#475569`
- **Margin Bottom:** 24px
- **Action Buttons:**
  - Print (Secondary Button)
  - Download PDF (Secondary Button)
  - Cancel/Edit (if applicable)

#### Status Badge
- **Background:** `#D1FAE5` (light green)
- **Text Color:** `#065F46` (dark green)
- **Label:** "Confirmed" / "In Transit" / "Delivered"
- **Padding:** 8px 16px
- **Border Radius:** 6px
- **Margin Bottom:** 24px

#### Info Cards (2-3 columns layout)

##### Card 1: Shipment Status
- **Title:** "Status"
- **Content:** Status badge + date/time
- **Background:** `#FFFFFF`
- **Padding:** 24px
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px

##### Card 2: Tracking
- **Title:** "Tracking Number"
- **Content:** BDL-123-4567 (copyable)
- **Copy Icon:** Color `#2563EB`, cursor pointer

##### Card 3: Est. Delivery
- **Title:** "Estimated Delivery"
- **Content:** Date + time range

#### Detailed Information Section
- **Title:** "Shipment Information"
- **Border Bottom:** 1px solid `#E2E8F0`
- **Padding Bottom:** 16px
- **Margin Bottom:** 24px

#### Two Column Information Display
| Left Column | Right Column |
|-------------|--------------|
| **From:** | **To:** |
| Name: Company A | Name: Company B |
| Address line 1 | Address line 1 |
| City, Postal | City, Postal |
| Contact: +1-234-567 | Contact: +1-234-567 |

#### Package Details Section
- **Title:** "Package Details"
- **Format:** Key-Value pairs
- **Left Column:** Labels (gray)
- **Right Column:** Values (dark)
- **Row Height:** 36px
- **Dividers:** 1px solid `#E2E8F0`

Content:
- Weight: 5.2 kg
- Dimensions: 30cm × 20cm × 15cm
- Contents: Electronics
- Shipment Type: Express
- Insurance: Yes, $150
- Special Handling: Fragile
- Reference: ORD-2025-001234

#### Timeline/Tracking Section
- **Title:** "Tracking Timeline"
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Padding:** 24px

**Timeline Items:**
- **Pending State:**
  - Circle: `#E2E8F0`
  - Text Color: `#94A3B8`
  - Font Size: 13px
  
- **Active/Completed State:**
  - Circle: `#10B981` (green)
  - Text Color: `#1E293B`
  - Checkmark icon: White
  - Font Size: 13px
  - Timestamp: Color `#94A3B8`, Font Size 12px
  
- **Vertical Line Connector:** `#E2E8F0` for incomplete, `#10B981` for completed

Timeline Stages (example):
1. Pickup Scheduled - Dec 10, 2:00 PM
2. Package Collected - Dec 10, 3:30 PM (completed, green)
3. In Transit - Dec 11, 8:00 AM (completed, green)
4. Out for Delivery - (pending)
5. Delivered - (pending)

#### Action Buttons (Bottom)
- **Layout:** Flex, gap 12px
- **Modify Shipment Button:** Secondary Button
- **Cancel Shipment Button:** Secondary Button (if cancellable)
- **Create New Shipment Button:** Primary Button
- **Contact Support Link:** Text link, Color `#2563EB`

---

## Design Patterns & Spacing

### Spacing Scale
```
4px  - xs (minimal gaps)
8px  - sm (small margins)
12px - md (medium margins)
16px - lg (standard margins)
24px - xl (large margins)
32px - 2xl (extra large margins)
48px - 3xl (maximum spacing)
```

### Padding Standards
- **Container Padding:** 24px or 32px
- **Card Padding:** 24px
- **Form Padding:** 32px
- **Button Padding:** 12px 24px (medium)
- **Input Padding:** 10px 12px

### Margins Standards
- **Section Spacing:** 32px between major sections
- **Form Field Spacing:** 24px between fields
- **Form Field Small:** 8px between related fields
- **Heading Margin Bottom:** 8px - 24px depending on context

### Border Radius
- **Default:** 6px (inputs, small components)
- **Cards/Containers:** 8px
- **Badges:** 12px (rounded)
- **Buttons:** 6px
- **Avatar:** 50% (circle)

### Box Shadows
| Depth | Shadow |
|-------|--------|
| None | No shadow |
| Subtle | 0 1px 3px rgba(0, 0, 0, 0.1) |
| Light | 0 4px 12px rgba(0, 0, 0, 0.15) |
| Medium | 0 10px 25px rgba(0, 0, 0, 0.1) |
| Dark | 0 20px 40px rgba(0, 0, 0, 0.2) |

### Focus States
- **Focus Ring Width:** 2px
- **Focus Ring Color:** `#2563EB`
- **Focus Ring Offset:** 2px
- **Box Shadow:** 0 0 0 2px `#FFFFFF`, 0 0 0 4px `#2563EB`

### Hover States
- **Button Hover:** Darker shade (10-20% darker)
- **Link Hover:** Underline + darker color
- **Card Hover:** Shadow increases, subtle scale
- **Interactive Elements:** Opacity 0.8 for disabled state

### Breakpoints
| Size | Width | Usage |
|------|-------|-------|
| Mobile | < 640px | Small phones |
| Tablet | 640px - 1024px | Tablets, small laptops |
| Desktop | > 1024px | Desktops, large screens |

### Responsive Grid
- **Mobile:** 1 column
- **Tablet:** 2 columns
- **Desktop:** 2-3 columns (depending on content)
- **Gap:** 16px - 24px

### Typography Hierarchy
1. **Page Heading (H1):** 32px, Bold
2. **Section Title (H2):** 24px, Bold
3. **Subsection (H3):** 20px, Semibold
4. **Card Title (H4):** 18px, Semibold
5. **Body Text:** 14px - 16px, Regular
6. **Secondary Text:** 12px - 14px, Regular
7. **Small Text:** 11px - 12px, Regular

---

## Additional Design Elements

### Loading States
- **Spinner:** Circular, color `#2563EB`, animation: rotate 1s linear infinite
- **Skeleton:** `#F1F5F9` background with animated shimmer
- **Loading Text:** "Loading..." with 3-dot animation

### Error States
- **Error Color:** `#EF4444`
- **Error Icon:** Exclamation mark in circle
- **Error Message:** Display below component, font size 11px

### Success States
- **Success Color:** `#10B981`
- **Success Icon:** Checkmark
- **Success Message:** Toast notification or inline message
- **Duration:** 3-5 seconds for toast

### Warning States
- **Warning Color:** `#F59E0B`
- **Warning Icon:** Exclamation mark triangle
- **Warning Message:** Inline or toast

### Disabled States
- **Opacity:** 50% or 60%
- **Cursor:** not-allowed
- **Color:** `#CBD5E1` (light gray)
- **Background:** `#F8FAFC` for inputs

### Empty States
- **Icon:** Large, color `#CBD5E1`
- **Message:** "No data available" or similar
- **Subtitle:** Helper text suggesting next action
- **Action Button:** Primary button to create/add item

### Transitions
- **Default Duration:** 200ms
- **Easing:** ease-in-out
- **Properties:** background-color, color, border-color, box-shadow
- **Hover Transitions:** Fast (150ms) for interactive elements

### Icons
- **Size Options:** 16px, 20px, 24px, 32px
- **Color:** Inherit from context or `#475569` (default)
- **Stroke Width:** 1.5px - 2px for outlined icons
- **Library Suggestion:** Feather Icons, Heroicons, or Material Icons

### Responsive Behavior
- **Sidebar:** Collapsible on mobile (hamburger menu)
- **Forms:** Stack vertically on mobile, 2 columns on desktop
- **Buttons:** Full width on mobile, auto width on desktop
- **Cards:** Stack on mobile, grid on desktop
- **Typography:** Slightly smaller on mobile (scale factor: 0.9)

---

## Implementation Notes

### Color Implementation (CSS Variables)
```css
--color-primary: #2563EB;
--color-primary-dark: #1D4ED8;
--color-primary-darker: #1E40AF;
--color-secondary: #F97316;
--color-success: #10B981;
--color-error: #EF4444;
--color-warning: #F59E0B;
--color-dark: #1E293B;
--color-light: #F8FAFC;
--color-border: #E2E8F0;
--color-text: #1E293B;
--color-text-secondary: #475569;
--color-text-tertiary: #94A3B8;
```

### Typography Implementation (CSS Variables)
```css
--font-family-base: 'Inter', 'Segoe UI', sans-serif;
--font-size-xs: 11px;
--font-size-sm: 12px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 18px;
--font-size-2xl: 20px;
--font-size-3xl: 24px;
--font-size-4xl: 32px;
```

### Form Best Practices
1. Always show required field indicators
2. Display error messages below fields, not in tooltip
3. Enable form submission only when all required fields are valid
4. Provide clear feedback for async validation (email uniqueness, etc.)
5. Use consistent field ordering across pages

### Accessibility
- **Color Contrast:** Minimum WCAG AA (4.5:1 for text)
- **Focus Indicators:** Always visible, minimum 2px outline
- **Form Labels:** Always associated with inputs (for attribute)
- **Error Messages:** Linked to form fields with aria-describedby
- **Icons:** Have appropriate alt text or aria-labels
- **Keyboard Navigation:** All interactive elements accessible via Tab

---

## File Summary

### Design Files Analyzed
1. ✅ Sign In.png - Authentication page
2. ✅ Sign Up.png - Registration page
3. ✅ New Shipment.png (versions 1-6) - Shipment creation form
4. ✅ Shipment Details Inputed.png - Shipment tracking/details view

### Next Steps for Development
1. Create reusable component library based on these specifications
2. Implement responsive design using the breakpoints defined
3. Set up CSS variables for colors and typography
4. Build form validation system
5. Create routing structure for all pages
6. Implement authentication flow
7. Build shipment management features
8. Add tracking functionality

---

**Document Version:** 1.0
**Last Updated:** December 10, 2025
**Status:** Ready for Development
