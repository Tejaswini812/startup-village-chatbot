# Host Features & Where They Appear on the Front Page

This document explains how each **Dashboard host feature** works and **where that content appears** on the homepage and across the site.

---

## 1. Host a Property (Find Your Stay)

| What it is | Host submits a **stay/homestay** (title, location, price, images, etc.). |
|------------|-----------------------------------------------------------------------------|
| **Dashboard action** | Dashboard → **Host a Property** → Multi-step form → Submit. |
| **Backend** | `POST /api/properties` → saved with `status: 'approved'` (no approval flow). |
| **Where it appears on front page** | **Find Your Stay** (first section on homepage). Same listings also appear on the full **Find Your Stay** page (`/hotels`). |
| **Homepage component** | `BookingSection` (stays + hotels + **properties** from API). |
| **Detail page** | **View Details** → `/stay/properties/:id` (StayDetailPage). |

---

## 2. Launch an Event

| What it is | Host creates an **event** (name, type, venue, date/time, price, capacity, etc.). |
|------------|-----------------------------------------------------------------------------------|
| **Dashboard action** | Dashboard → **Launch Events** → MultiStepEventForm → Submit. |
| **Backend** | `POST /api/events` → Event model (accepts category, location/dateTime/contactInfo as JSON). |
| **Where it appears on front page** | **Events** section on homepage (below Find Your Stay). |
| **Homepage component** | `EventsSection` → fetches `GET /api/events`. |
| **Detail page** | **View Details** → `/event/:id` (EventDetailPage). **Book tickets** opens payment/booking on same page. |

---

## 3. Host a Land Property (Buy & Sell / Lease)

| What it is | Host lists **land** (title, land type, size/area, price, location, etc.). |
|------------|-----------------------------------------------------------------------------|
| **Dashboard action** | Dashboard → **Host a Land Property** → MultiStepLandPropertyForm → Submit. |
| **Backend** | `POST /api/land-properties` → LandProperty model (accepts size→area, defaults for purpose/ownership). |
| **Where it appears on front page** | **Buy & Sell / Lease → Property** section (property cards: both houses and **land**). |
| **Homepage component** | `PropertySection` → fetches `GET /api/properties` and `GET /api/land-properties` and shows both. |
| **Detail page** | **Buy Now** → `/buy-property/land-properties/:id` or `/buy-property/properties/:id` (BuyPropertyDetailPage). |

---

## 4. Create a Car (Car Reselling)

| What it is | Host lists a **car** for resale (make, model, year, price, mileage, fuel type, etc.). |
|------------|----------------------------------------------------------------------------------------|
| **Dashboard action** | Dashboard → **Car Reselling** / Create a car → MultiStepCarForm → Submit. |
| **Backend** | `POST /api/cars` → Car model (defaults for location, seller if missing). |
| **Where it appears on front page** | **Car Reselling** section on homepage. |
| **Homepage component** | `CarResellingSection` → fetches `GET /api/cars`. |
| **Detail page** | **View Details** → `/car/:id` (CarDetailPage). **Inquire / Buy** on same page. |

---

## 5. List Package / Trip

| What it is | Host creates a **travel package** (title, destination, duration, price, includes/excludes, etc.). |
|------------|---------------------------------------------------------------------------------------------------|
| **Dashboard action** | Dashboard → **List Package/Trip** → MultiStepPackageForm → Submit. |
| **Backend** | `POST /api/packages` → Package model (default packageType, duration as string). |
| **Where it appears on front page** | **Packages / Trips** section on homepage. |
| **Homepage component** | `PackagesSection` → fetches `GET /api/packages`. |
| **Detail page** | **View Details** → `/package/:id` (PackageDetailPage). **Book now** on same page. |

---

## 6. Create a Product (Products / Accessories)

| What it is | Host adds a **product** (name, category, price, quantity, condition, etc.). Shown as product/accessory. |
|------------|----------------------------------------------------------------------------------------------------------|
| **Dashboard action** | Dashboard → **Create a Product** / Add product → MultiStepProductForm → Submit. |
| **Backend** | `POST /api/products` → Product model (default seller if missing). |
| **Where it appears on front page** | **Products / Accessories** section on homepage (products + accessories from API). |
| **Homepage component** | `AccessoriesSection` → fetches `GET /api/accessories` and `GET /api/products` and combines them. |
| **Detail page** | **Buy Now** → `/product-detail/products/:id` or `/product-detail/accessories/:id` (ProductDetailPage). |

---

## Homepage Order (Top to Bottom)

1. **Find Your Stay** (BookingSection) – Host a property → appears here
2. **Events** (EventsSection) – Launch events → appears here
3. **Buy & SELL / lease → Property** (PropertySection) – Host a land property → appears here
4. **Zoom Car / CAR Resale EXPO** (CarResellingSection) – Car reselling → appears here
5. **Source From our online stores** (AccessoriesSection) – Create a product → appears here
6. **Travel Packages** (PackagesSection) – List package/trip → appears here (subtitle: Source From our online stores)

---

## Summary Table

| Host feature           | API route            | Appears on homepage in              | Full listing page |
|------------------------|----------------------|--------------------------------------|-------------------|
| Host a Property        | POST /api/properties | Find Your Stay                       | /hotels           |
| Launch Events          | POST /api/events     | Events                               | /events           |
| Host a Land Property   | POST /api/land-properties | Buy & SELL / lease → Property  | /properties       |
| Car reselling          | POST /api/cars       | Zoom Car / CAR Resale EXPO           | /cars             |
| Create a product       | POST /api/products   | Source From our online stores        | /accessories      |
| List package/trip      | POST /api/packages   | Travel Packages                      | /packages         |

---

## Backend Behaviour (All Host Features)

- **No approval flow**: All submissions are stored and shown immediately (no pending/approve).
- **Image compression**: Uploads go through backend compression (Sharp) and optional frontend compression before upload.
- **Defaults**: Backend adds safe defaults for missing required fields (e.g. location, seller, packageType, purpose, ownership) so submissions do not fail with 500.

After hosting, **refresh the homepage** (or open the relevant section) to see the new listing.
