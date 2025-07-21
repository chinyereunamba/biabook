# BookMe Utility Functions

This document provides information about the utility functions used in the BookMe application.

## Business Utilities

### `getBusiness`

**File**: `src/lib/get-business.ts`

**Purpose**: Fetches the current user's business from the database based on the authenticated user session.

**Usage**:

```typescript
import { getBusiness } from "@/lib/get-business";

// In a server component:
const business = await getBusiness();
```

**Returns**: A Promise that resolves to a Business object or null if no business is found or the user is not authenticated.

**Implementation Details**:

- Uses the auth() function from NextAuth to get the current session
- Queries the database for a business where the ownerId matches the current user's ID
- Returns the business object or null if not found

**Example**:

```typescript
// In a server component like a layout or page
export default async function DashboardLayout({ children }) {
  const business = await getBusiness();

  return (
    <div>
      {business && <h1>{business.name}</h1>}
      {children}
    </div>
  );
}
```

## API Routes

The application also includes an API route to fetch the current user's business:

**Endpoint**: `GET /api/me/business`

**File**: `src/app/api/me/business/route.ts`

**Response**:

```json
{
  "business": {
    "id": "business-id",
    "name": "Business Name",
    "description": "Business Description",
    "location": "Business Location",
    "phone": "Business Phone",
    "email": "business@example.com",
    "categoryId": "category-id",
    "ownerId": "user-id",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:

- 401 Unauthorized: If the user is not authenticated
- 500 Internal Server Error: If there's an error fetching the business
