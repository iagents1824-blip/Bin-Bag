# BinBag Admin API (Ingestion)

This document describes the internal API endpoints used for automated ingestion into the BinBag backend (e.g., via n8n automation).

## Authentication

All endpoints under `/api/admin` require a valid API key passed in the `x-api-key` header.

```http
x-api-key: <your_ingest_api_key_here>
```
If the header is missing or incorrect, the server will return `401 Unauthorized`.

---

## Endpoints

### 1. Check for existing listing

Checks whether a listing with a similar name already exists, allowing the automation to avoid creating duplicates. The match is case-insensitive and fuzzy/partial.

**Request**
```http
GET /api/admin/listings/check?name=GPT-4o
```

**Response (200 OK) - Exists**
```json
{
  "exists": true,
  "matched_name": "GPT-4o API",
  "matched_id": "abc12345"
}
```

**Response (200 OK) - Does not exist**
```json
{
  "exists": false
}
```

---

### 2. Create new listing

Creates a new listing in the database. The listing is always created with `status: "pending_review"` and cannot be auto-published via this endpoint.

**Request**
```http
POST /api/admin/listings
Content-Type: application/json

{
  "name": "Super AI Tool",
  "slug": "super-ai-tool", 
  "short_description": "A very short description.",
  "long_description": "A much longer description...",
  "category": "chatbot",
  "subcategory": "productivity",
  "pricing_model": "freemium",
  "website_url": "https://superai.example.com",
  "logo_url": "https://superai.example.com/logo.png",
  "source": "n8n_automation",
  "source_url": "https://source.example.com/post",
  "launch_date": "2024-05-13"
}
```

*Note: `slug` is optional and will be auto-generated from `name` if not provided.*

**Validation Rules**
- **Required fields:** `name`, `website_url`, `category`
- **Allowed `category` values:** `chatbot`, `audio`, `video`, `image`, `document`, `code`, `agent`, `api`, `browser-extension`, `writing`, `other`, `research`, `learning`, `job`, `community`, `dataset`, `framework`, `event`, `podcast`
- **Allowed `pricing_model` values:** `free`, `freemium`, `paid`, `open-source` (or omit for `null`)

**Response (201 Created)**
```json
{
  "id": "generated-uuid",
  "name": "Super AI Tool",
  "slug": "super-ai-tool",
  "status": "pending_review",
  ...
}
```

**Response (409 Conflict)**
Returned if a listing with the exact `slug` already exists.
```json
{
  "error": "Listing with slug 'super-ai-tool' already exists (ID: abc12345)"
}
```
