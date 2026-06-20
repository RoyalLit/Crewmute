# API Reference Documentation

This directory contains API endpoint reference documentation for Crewmute.

## Structure

Each feature's endpoints are documented in their own file:

```
docs/api/
├── README.md          ← This file
├── auth.md            ← /auth endpoints (added with auth feature PR)
├── users.md           ← /users endpoints
├── rides.md           ← /rides endpoints
├── requests.md        ← /requests endpoints
└── chats.md           ← /chats endpoints
```

## Format

Each endpoint is documented with:
- Method and path
- Authentication requirement
- Request parameters (path, query, body) with types and validation rules
- Success response schema with example
- Error responses (status codes and error codes)

## When to Update

API documentation must be updated in the **same PR** as the code change — never in a follow-up. Every new, changed, or deleted endpoint requires an update to this directory.

## Base URL

```
Production: https://crewmute-api.railway.app/api/v1
Local:      http://localhost:5000/api/v1
```

## Common Response Envelope

All responses follow this structure:

```json
// Success
{
  "success": true,
  "data": { }
}

// Success (paginated)
{
  "success": true,
  "data": [ ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 143,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": { }
  }
}
```
