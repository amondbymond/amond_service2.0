# Content Direction Assignment Fix

## Problem

The frontend was sending `contentDirections` array to the content/request POST endpoint, but the direction was not being saved to individual content items. All content items were showing as "정보형" in the frontend calendar even when different directions were selected.

## Root Cause

1. The `contentDirections` array was being stored in the `contentRequest` table as `directionList`
2. Individual content items in the `content` table didn't have a `direction` field
3. The direction was not being assigned to individual content items during creation
4. The direction field was not returned in the content/detail response

## Solution Implemented

### 1. Database Schema Update

- Added `direction` field to the `content` table
- Set default value to "정보형"
- Updated existing content items with default direction

### 2. Content Creation Logic Update

- Modified `/content/request` endpoint to assign directions to individual content items
- Each content item now gets a direction from the `contentDirections` array
- If there are more content items than directions, the directions cycle through the array
- Fallback to "정보형" if no direction is provided

### 3. API Response Update

- Updated `/content/detail` endpoint to return the `direction` field
- Updated admin content list endpoint to include direction field

### 4. Files Modified

- `router/content.ts` - Main logic changes
- `router/admin.ts` - Admin endpoint update
- `add_direction_field.sql` - Database migration script
- `run_migration.js` - Node.js migration runner

## How to Apply the Fix

### Step 1: Run Database Migration

```bash
node run_migration.js
```

### Step 2: Restart the Server

The code changes are already applied. Just restart your server:

```bash
npx nodemon
```

## Testing the Fix

### 1. Create New Content

Send a POST request to `/content/request` with:

```json
{
  "contentSettings": {
    "contentDirections": [
      "감성전달형",
      "감성전달형",
      "감성전달형",
      "감성전달형"
    ]
  }
}
```

### 2. Check Content Details

Send a GET request to `/content/detail?contentRequestId=<id>` and verify that each content item has a `direction` field with the correct value.

### 3. Verify Frontend Display

The frontend calendar should now show the correct direction for each content item instead of all showing "정보형".

## Code Changes Summary

### Content Creation (router/content.ts:306-312)

```typescript
// Before
const contentSql = `INSERT INTO content(postDate, subject, fk_contentRequestId)
VALUES(?, ?, ?);`;

// After
const directionList =
  contentSettings.contentDirections || contentSettings.directionList || [];
const direction = directionList[i % directionList.length] || "정보형";
const contentSql = `INSERT INTO content(postDate, subject, direction, fk_contentRequestId)
VALUES(?, ?, ?, ?);`;
```

### Content Detail Response (router/content.ts:533-535)

```typescript
// Before
const contentSql = `SELECT id, postDate, subject, imageUrl, caption FROM content`;

// After
const contentSql = `SELECT id, postDate, subject, imageUrl, caption, direction FROM content`;
```

## Notes

- The fix is backward compatible - existing content items will have "정보형" as their default direction
- The direction assignment cycles through the provided array if there are more content items than directions
- The direction field is preserved during content regeneration operations
