# TMS API Reference (nnt.nntexpressinc.com)

> **Note on sample data**: Example payloads below mirror the real-world structures returned by the production Django REST API. Field names and nesting reflect the live schema your React client currently consumes. The values have been anonymized where necessary.

## Base URL & General Conventions
- **Base URL**: `https://nnt.nntexpressinc.com/api`
- **Versioning**: Not currently versioned; endpoints live directly under `/api/`.
- **Authentication**: JSON Web Tokens (JWT). Supply the `access` token in the `Authorization` header as `Bearer <token>`.
- **Content types**:
  - JSON endpoints: `Content-Type: application/json`
  - Upload endpoints (`/documents/`, profile photos): `Content-Type: multipart/form-data`
- **Pagination**: `GET /load/` and some related list endpoints follow the standard DRF pagination contract (`count`, `next`, `previous`, `results`). Most other lists return plain arrays.
- **Common errors**: `401 Unauthorized` (missing/expired token), `403 Forbidden` (role lacks permission), `404 Not Found` (invalid resource id), `500 Internal Server Error` (unexpected backend failure).

---

## 1. Authentication

### POST `/auth/login/`
Authenticate a user and obtain access & refresh tokens. Geolocation/device telemetry is sent afterwards through `/auth/location/` but is not required for authentication itself.

**Headers**
```
Content-Type: application/json
Accept: application/json
```

**Request body**
```json
{
  "email": "dispatcher@nntexpressinc.com",
  "password": "••••••••"
}
```

**Response 200**
```json
{
  "access": "eyJ0eXA...Qss",
  "refresh": "eyJ0eXA...8Dj",
  "user_id": 57,
  "user": {
    "id": 57,
    "email": "dispatcher@nntexpressinc.com",
    "first_name": "Ariana",
    "last_name": "Freeman",
    "role": 4,
    "company_name": "NNT Express Inc",
    "telephone": "+1-773-555-7821"
  }
}
```

**Errors**
- `400 Bad Request` – malformed payload.
- `401 Unauthorized` – wrong email/password.
- `423 Locked` – optional lock if too many failed attempts (if enabled).
- `500 Internal Server Error` – backend failure.

---

### POST `/auth/register/`
Create a portal user (drivers, dispatchers, admins). The React Driver Create flow posts `multipart/form-data` to support profile photos.

**Headers**
```
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Request body (multipart/form-data)**
```
email=driver214@fleetdemo.com
first_name=Marcus
last_name=Reed
company_name=NNT Express Inc
telephone=+1-312-555-0198
country=USA
state=IL
city=Chicago
address=344 N Franklin St
postal_zip=60606
role=6
password=Driver214!
password2=Driver214!
profile_photo=@/path/cdl-headshot.jpg
```

**Response 201**
```json
{
  "user_id": 214,
  "email": "driver214@fleetdemo.com",
  "role": 6,
  "message": "User created successfully"
}
```

**Errors**
- `400 Bad Request` – validation failure (e.g., password mismatch, duplicate email).
- `401 Unauthorized` – missing/expired admin token.
- `500 Internal Server Error` – storage failure.

---

### POST `/auth/token/refresh/`
Exchange a refresh token for a new access token.

**Request body**
```json
{
  "refresh": "eyJ0eXA...8Dj"
}
```

**Response 200**
```json
{
  "access": "eyJ0eXA...p1U"
}
```

**Errors**
- `401 Unauthorized` – refresh token expired or revoked.

---

### POST `/auth/token/verify/`
Validate that a JWT is still active.

**Request body**
```json
{
  "token": "eyJ0eXA...p1U"
}
```

**Response 200** – empty body (`204 No Content` equivalent) when valid.

**Errors**
- `401 Unauthorized` – token expired/invalid.

---

## 2. Driver Management

### GET `/driver/`
Return all driver profiles visible to the requester. The current backend returns a plain array.

**Headers**: `Authorization: Bearer <access-token>`

**Sample response**
```json
[
  {
    "id": 214,
    "driver_status": "In-Transit",
    "employment_status": "ACTIVE (DF)",
    "driver_license_id": "R6421185",
    "driver_license_state": "IL",
    "driver_license_expiration": "2026-04-12",
    "driver_type": "COMPANY_DRIVER",
    "telegram_username": "@marcus.reed",
    "mc_number": "112356",
    "permile": "0.65",
    "tariff": "30",
    "cost": "1450.00",
    "escrow_deposit": "750.00",
    "assigned_truck": 78,
    "assigned_trailer": 205,
    "assigned_dispatcher": 12,
    "team_driver": null,
    "notes": "Team-ready, HazMat certified",
    "user": {
      "id": 502,
      "email": "driver214@fleetdemo.com",
      "first_name": "Marcus",
      "last_name": "Reed",
      "company_name": "NNT Express Inc",
      "telephone": "+1-312-555-0198",
      "city": "Chicago",
      "state": "IL",
      "country": "USA",
      "address": "344 N Franklin St",
      "postal_zip": "60606",
      "role": 6,
      "profile_photo": "/media/profile/502_1730304455.jpg"
    }
  }
]
```

**Errors**: `401`, `500`.

---

### GET `/driver/{id}/`
Fetch a single driver with nested company, assignments, pay & expense aggregates.

**Sample response**
```json
{
  "id": 214,
  "driver_status": "In-Transit",
  "employment_status": "ACTIVE (DF)",
  "birth_date": "1990-09-17",
  "driver_license_id": "R6421185",
  "driver_license_state": "IL",
  "driver_license_expiration": "2026-04-12",
  "driver_type": "COMPANY_DRIVER",
  "telegram_username": "@marcus.reed",
  "motive_id": "MOT-33255",
  "other_id": null,
  "notes": "Team-ready, HazMat certified",
  "permile": "0.65",
  "tariff": "30",
  "cost": "1450.00",
  "payd": "0.00",
  "escrow_deposit": "750.00",
  "assigned_truck": {
    "id": 78,
    "unit_number": "8064",
    "plate": "P123456"
  },
  "assigned_trailer": {
    "id": 205,
    "unit_number": "TR-9902",
    "plate": "T99812"
  },
  "assigned_dispatcher": {
    "id": 12,
    "nickname": "ABrown"
  },
  "user": {
    "id": 502,
    "email": "driver214@fleetdemo.com",
    "first_name": "Marcus",
    "last_name": "Reed",
    "company_name": "NNT Express Inc",
    "telephone": "+1-312-555-0198",
    "country": "USA",
    "state": "IL",
    "city": "Chicago",
    "address": "344 N Franklin St",
    "postal_zip": "60606",
    "role": 6,
    "ext": null,
    "fax": null,
    "company": 1,
    "profile_photo": "/media/profile/502_1730304455.jpg"
  },
  "documents": [
    {
      "id": 88,
      "file_name": "cdl-front.jpg",
      "file_type": "CDL_FRONT",
      "file_url": "/media/driver/docs/88-cdl-front.jpg",
      "uploaded_at": "2024-11-02T14:27:55Z"
    },
    {
      "id": 91,
      "file_name": "medical-card.pdf",
      "file_type": "MEDICAL",
      "file_url": "/media/driver/docs/91-medical-card.pdf",
      "uploaded_at": "2024-11-02T14:29:18Z"
    }
  ]
}
```

---

### POST `/driver/`
Create a driver profile once the associated user exists.

**Headers**: `Authorization: Bearer <access-token>`

**Request body (JSON)**
```json
{
  "user": 502,
  "driver_status": "Available",
  "employment_status": "ACTIVE (DF)",
  "driver_license_id": "R6421185",
  "driver_license_state": "IL",
  "driver_license_expiration": "2026-04-12",
  "driver_type": "COMPANY_DRIVER",
  "driver_license_class": "A",
  "telegram_username": "@marcus.reed",
  "motive_id": "MOT-33255",
  "mc_number": "112356",
  "permile": 0.65,
  "tariff": 30,
  "cost": 1450,
  "escrow_deposit": 750,
  "assigned_truck": 78,
  "assigned_trailer": 205,
  "assigned_dispatcher": 12,
  "created_by": 7
}
```

**Response 201** – newly created driver JSON (same shape as GET).

**Errors**: `400` (validation), `401`, `500`.

---

### PUT `/driver/{id}/`
Full update. Use `multipart/form-data` if uploading new files/photos, otherwise JSON.

**Sample request (multipart)**
```
_driver_status=Home
employment_status=ACTIVE (DF)
permile=0.68
notes=Home time requested
updated_by=7
profile_photo=@/path/home-time.jpg
```

**Response 200** – updated driver payload.

**Errors**: `400`, `401`, `404`, `500`.

---

### DELETE `/driver/{id}/`
Deletes the driver profile. Associated user is not automatically removed.

- **Response 204** – no body on success.
- **Errors**: `401`, `403`, `404`.

---

### GET `/driver/{id}/loads/`
Loads dispatched to the driver (paginated array).

**Sample response**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 983,
      "load_id": "FX-2024-1101",
      "reference_id": "REF-9912",
      "load_status": "COVERED",
      "invoice_status": "NOT_DETERMINED",
      "customer_broker": {
        "id": 44,
        "company_name": "Flexport Logistics",
        "mc_number": "873443"
      },
      "total_pay": "4650.00",
      "driver_pay": "2600.00",
      "total_miles": 1215,
      "stop": [
        {
          "id": 2211,
          "stop_name": "PICKUP",
          "city": "Chicago",
          "state": "IL",
          "appointmentdate": "2024-11-03T08:00:00Z"
        },
        {
          "id": 2212,
          "stop_name": "DELIVERY",
          "city": "Dallas",
          "state": "TX",
          "appointmentdate": "2024-11-05T14:00:00Z"
        }
      ]
    }
  ]
}
```

---

### GET `/driver/{id}/documents/`
Metadata for every file linked to the driver.

```json
[
  {
    "id": 88,
    "file_name": "cdl-front.jpg",
    "file_type": "CDL_FRONT",
    "file_size": 428222,
    "file_url": "/media/driver/docs/88-cdl-front.jpg",
    "uploaded_at": "2024-11-02T14:27:55Z",
    "uploaded_by": 7
  },
  {
    "id": 91,
    "file_name": "medical-card.pdf",
    "file_type": "MEDICAL",
    "file_size": 312801,
    "file_url": "/media/driver/docs/91-medical-card.pdf",
    "uploaded_at": "2024-11-02T14:29:18Z",
    "uploaded_by": 7
  }
]
```

---

## 3. Load Management

### GET `/load/`
Paginated loads with rich joins (driver, broker, dispatcher, stops, tags).

**Query parameters**
- `page`, `page_size` – pagination (default 25).
- `search` – matches `load_id`, `reference_id`, driver, broker.
- `load_status`, `invoice_status` – filter by enumerations shown in the UI (`OPEN`, `COVERED`, `DELIVERED`, etc.).

**Sample request**
```
GET /api/load/?page=1&page_size=25&load_status=OPEN
Authorization: Bearer <access-token>
```

**Sample response**
```json
{
  "count": 143,
  "next": "https://nnt.nntexpressinc.com/api/load/?page=2&page_size=25&load_status=OPEN",
  "previous": null,
  "results": [
    {
      "id": 1103,
      "load_id": "NT-241104-01",
      "reference_id": "PO-556233",
      "company_name": "NNT Express Inc",
      "customer_broker": {
        "id": 77,
        "company_name": "Amazon Relay",
        "mc_number": "572948",
        "contact_number": "+1-615-555-8811"
      },
      "driver": {
        "id": 214,
        "user": {
          "first_name": "Marcus",
          "last_name": "Reed",
          "email": "driver214@fleetdemo.com"
        }
      },
      "dispatcher": {
        "id": 12,
        "nickname": "ABrown"
      },
      "team_id": null,
      "truck": 78,
      "trailer": 205,
      "load_status": "COVERED",
      "invoice_status": "NOT_DETERMINED",
      "trip_status": "ON_ROUTE",
      "trip_bil_status": null,
      "equipment_type": "53' Dry Van",
      "load_pay": "4800.00",
      "driver_pay": "2700.00",
      "total_pay": "4800.00",
      "per_mile": "3.95",
      "total_miles": 1215,
      "note": "Amazon live load",
      "flagged": false,
      "stop": [
        {
          "id": 3401,
          "stop_name": "PICKUP",
          "city": "Joliet",
          "state": "IL",
          "address": "1500 Channahon Rd",
          "appointmentdate": "2024-11-04T10:00:00Z"
        },
        {
          "id": 3402,
          "stop_name": "DELIVERY",
          "city": "St. Louis",
          "state": "MO",
          "appointmentdate": "2024-11-05T06:00:00Z"
        }
      ]
    }
  ]
}
```

---

### GET `/load/{id}/`
All data for a single load, including paperwork and chat context references.

```json
{
  "id": 1103,
  "load_id": "NT-241104-01",
  "reference_id": "PO-556233",
  "company_name": "NNT Express Inc",
  "customer_broker": {...},
  "driver": {...},
  "dispatcher": {...},
  "truck": 78,
  "trailer": 205,
  "load_status": "COVERED",
  "invoice_status": "NOT_DETERMINED",
  "equipment_type": "53' Dry Van",
  "instructions": "Live load, straps required",
  "bills": null,
  "rate_con": "/media/load/1103/ratecon.pdf",
  "bol": "/media/load/1103/bol.pdf",
  "pod": null,
  "tags": ["Amazon", "Priority"],
  "stop": [...],
  "chat": {
    "thread_id": 551,
    "unread_count": 2
  }
}
```

---

### PUT `/load/{id}/status/`
Update only the status fields without resubmitting the entire record.

**Request body**
```json
{
  "load_status": "DELIVERED",
  "invoice_status": "INVOICED",
  "updated_by": 12
}
```

**Response 200**
```json
{
  "id": 1103,
  "load_status": "DELIVERED",
  "invoice_status": "INVOICED",
  "updated_at": "2024-11-06T21:02:44Z"
}
```

**Errors**: `400` (invalid status transition), `401`, `404`.

---

### GET `/load/{id}/documents/`
List all uploaded files for the load.

```json
[
  {
    "id": 601,
    "category": "RATE_CON",
    "file_name": "NT-241104-01-ratecon.pdf",
    "file_size": 355812,
    "file_url": "/media/load/1103/ratecon.pdf",
    "uploaded_at": "2024-11-03T19:45:10Z",
    "uploaded_by": 12
  },
  {
    "id": 604,
    "category": "BOL",
    "file_name": "NT-241104-01-bol.pdf",
    "file_url": "/media/load/1103/bol.pdf",
    "uploaded_at": "2024-11-05T12:02:11Z"
  }
]
```

Uploads are performed through `POST /load/{id}/documents/` with `multipart/form-data` (same fields plus the binary `file`).

---

### GET `/load/{id}/chat/`
Retrieve threaded chat messages bound to the load. REST is used as the fallback when WebSocket is unavailable.

```json
[
  {
    "id": 9221,
    "message": "Arrived at Joliet FC, checking in now.",
    "user": {
      "id": 214,
      "name": "Marcus Reed"
    },
    "attachments": [],
    "created_at": "2024-11-04T15:02:18Z"
  },
  {
    "id": 9224,
    "message": "Copy that, let us know once loaded.",
    "user": {
      "id": 12,
      "name": "Anthony Brown"
    },
    "attachments": [],
    "created_at": "2024-11-04T15:04:03Z"
  }
]
```

---

## 4. Data Models

### LoginRequest / LoginResponse
| Field | Type | Notes |
| --- | --- | --- |
| `email` | string | User login email. |
| `password` | string | Minimum 8 chars. |
| `access` | string (JWT) | Used for `Authorization` header. |
| `refresh` | string (JWT) | Call `/auth/token/refresh/` when `access` expires. |
| `user_id` | int | Primary key in `auth_user` table. |
| `user` | object | Basic profile snapshot cached on the client. |

### User (embedded inside Driver, Load->Dispatcher, etc.)
| Field | Type | Example |
| --- | --- | --- |
| `id` | int | `502` |
| `email` | string | `driver214@fleetdemo.com` |
| `first_name` / `last_name` | string | `Marcus` / `Reed` |
| `telephone` | string | `+1-312-555-0198` |
| `company_name` | string | `NNT Express Inc` |
| `city`, `state`, `country`, `postal_zip` | string | `Chicago`, `IL`, `USA`, `60606` |
| `role` | int | Foreign key to `/auth/role/`. |
| `profile_photo` | string | Relative media URL. |

### Driver
```json
{
  "id": 214,
  "user": { ... },
  "driver_status": "In-Transit",
  "employment_status": "ACTIVE (DF)",
  "birth_date": "1990-09-17",
  "driver_license_id": "R6421185",
  "dl_class": "A",
  "driver_type": "COMPANY_DRIVER",
  "driver_license_state": "IL",
  "driver_license_expiration": "2026-04-12",
  "telegram_username": "@marcus.reed",
  "motive_id": "MOT-33255",
  "mc_number": "112356",
  "permile": "0.65",
  "tariff": "30",
  "cost": "1450.00",
  "escrow_deposit": "750.00",
  "team_driver": null,
  "assigned_truck": 78,
  "assigned_trailer": 205,
  "assigned_dispatcher": 12,
  "documents": [...],
  "created_by": 7,
  "updated_by": 12,
  "created_at": "2024-10-28T20:14:02Z",
  "updated_at": "2024-11-05T09:21:44Z"
}
```

### Load / Trip
```json
{
  "id": 1103,
  "load_id": "NT-241104-01",
  "reference_id": "PO-556233",
  "company_name": "NNT Express Inc",
  "customer_broker": {
    "id": 77,
    "company_name": "Amazon Relay",
    "mc_number": "572948",
    "billing_type": "NET7"
  },
  "driver": {
    "id": 214,
    "user": { "first_name": "Marcus", "last_name": "Reed" }
  },
  "dispatcher": {
    "id": 12,
    "nickname": "ABrown"
  },
  "unit_id": 65,
  "truck": 78,
  "trailer": 205,
  "team_id": null,
  "equipment_type": "53' Dry Van",
  "load_status": "COVERED",
  "invoice_status": "NOT_DETERMINED",
  "trip_status": "ON_ROUTE",
  "load_pay": "4800.00",
  "driver_pay": "2700.00",
  "total_pay": "4800.00",
  "per_mile": "3.95",
  "mile": 1150,
  "empty_mile": 65,
  "total_miles": 1215,
  "note": "Amazon live load",
  "flagged": false,
  "documents": [ {"category": "RATE_CON", ...} ],
  "stop": [
    {
      "id": 3401,
      "stop_name": "PICKUP",
      "sequence": 1,
      "city": "Joliet",
      "state": "IL",
      "address": "1500 Channahon Rd",
      "appointmentdate": "2024-11-04T10:00:00Z",
      "contact": "Dock 7"
    },
    {
      "id": 3402,
      "stop_name": "DELIVERY",
      "sequence": 2,
      "city": "St. Louis",
      "state": "MO",
      "appointmentdate": "2024-11-05T06:00:00Z"
    }
  ],
  "chat": [ ... ],
  "created_by": 7,
  "created_date": "2024-11-03",
  "updated_date": "2024-11-05"
}
```

### Company
Returned from `/auth/company/` and embedded in user metadata.

```json
{
  "id": 1,
  "legal_name": "NNT Express Inc",
  "dba_name": "NNT Express",
  "dot_number": "3052514",
  "mc_number": "572948",
  "primary_contact": "Anthony Brown",
  "contact_email": "ops@nntexpressinc.com",
  "contact_phone": "+1-773-555-1244",
  "address": "2510 S Damen Ave",
  "city": "Chicago",
  "state": "IL",
  "postal_zip": "60608",
  "country": "USA",
  "billing_type": "NET7",
  "created_at": "2021-03-12T15:22:18Z",
  "updated_at": "2024-10-01T09:44:11Z"
}
```

---

## 5. Error Handling & Status Codes
| Status | Meaning | Typical Cause |
| --- | --- | --- |
| `200 OK` | Successful read/update | Happy path for GET/PUT/PUT status |
| `201 Created` | Resource created | POST `/driver/`, `/load/`, `/auth/register/` |
| `204 No Content` | Successful delete | `DELETE /driver/{id}/` |
| `400 Bad Request` | Validation failure | Missing required field, invalid enum |
| `401 Unauthorized` | Missing/expired token | JWT absent or expired |
| `403 Forbidden` | Insufficient permissions | Role not allowed to mutate resource |
| `404 Not Found` | Invalid resource id | Driver/load id doesn’t exist |
| `409 Conflict` | Resource already exists | Duplicate email during register |
| `500 Internal Server Error` | Unexpected backend error | Database/service outage |

---

## Implementation Tips for Frontend Developers
- Cache `accessToken`, `refreshToken`, `userid`, and the serialized user profile in `localStorage` (as already done in `LoginPage.jsx`).
- Always guard API calls with token presence. When a 401 occurs, force logout and redirect to `/login` (logic already implemented in `ApiService`).
- Use the paginated links (`next`, `previous`) returned by `/load/` rather than manually incrementing page numbers to avoid off-by-one issues with server-side filtering.
- File uploads (`driver` docs, load documents) must omit `Content-Type` headers so the browser can append the proper multipart boundary.
- For chat, open the WebSocket channel at `wss://nnt.nntexpressinc.com/ws/chat/{user_id}/{load_id}/` and fall back to `GET /load/{id}/chat/` to hydrate history (see `src/api/chat.js`).

This document centralizes the production endpoints currently used by the React client so the frontend team can onboard faster, build typed clients, and keep request/response contracts in sync with the Django REST backend.
