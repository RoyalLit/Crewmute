# API Reference Documentation

This directory contains API endpoint reference documentation for Crewmute.

All REST endpoints are documented in detail in the project's [ARCHITECTURE.md](../../ARCHITECTURE.md#4-api-endpoints) (Section 4).

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
