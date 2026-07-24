# Crewmute: Comprehensive Project Showcase

Crewmute is a complete, full-stack ecosystem built to solve a very specific, high-friction problem in India: **intercity carpooling for college students going home on weekends and holidays.** 

Unlike generic carpool apps (which target daily office commuters) or WhatsApp groups (which lack structure, trust, and payments), Crewmute provides a verified, end-to-end platform for students to find rides, coordinate, and pay seamlessly.

This document serves as a complete technical and functional overview of the Crewmute platform.

---

## 1. The Ecosystem

Crewmute is not just a single application. It is a distributed ecosystem consisting of three main parts:

1. **The Mobile App**: A React Native application for iOS and Android. This is the primary interface for all students (both drivers and passengers).
2. **The Backend API**: A Node.js/Express server backed by MongoDB and Socket.io, handling all business logic, real-time events, and data persistence.
3. **The Web Admin Dashboard**: A React/Next.js web application used exclusively by campus ambassadors and platform moderators to verify student identities, monitor live SOS alerts, and oversee platform health.

---

## 2. Core Functional Features

### 2.1 Identity Verification & Trust Engine
Safety is the core pillar of Crewmute. The platform operates as a walled garden:
- **.edu.in Email Verification**: Automated, instant onboarding for students with official college email addresses (using OTPs delivered via Nodemailer).
- **Manual ID Verification**: A fallback for students without institutional emails. They upload a photo of their physical student ID. These uploads land in the Web Admin Dashboard's queue, where a human moderator manually approves or rejects them.
- **Profiles & Ratings**: Users build a reputation over time. Ride history, average ratings, and total reviews are publicly visible to help users make informed decisions before accepting a ride request.

### 2.2 Ride Discovery & Lifecycle
- **Intelligent Posting**: Posters define the route (using Google Places API autocomplete), departure datetime, cab type, total seats, and fare per seat.
- **Search & Filter**: Passengers query active rides by combining From/To routes and specific dates.
- **Automated Lifecycle Management**: Rides have distinct states (`active`, `full`, `expired`, `cancelled`). A cron-like mechanism expires rides once their departure time passes, ensuring the feed never shows stale data.

### 2.3 The Request & Coordination Engine
- **Seat Requests**: Passengers don't just "join" a ride; they request a seat. The poster is notified and can review the requester's profile before hitting Accept or Reject.
- **Real-Time Seat Counters**: Upon acceptance, the system automatically decrements available seats. If seats hit 0, the ride status transitions to `full` automatically.

### 2.4 P2P UPI Deep Linking (Zero-Fee Payments)
Instead of forcing users through a heavy payment gateway (like Razorpay) which takes a 2% cut and requires strict merchant onboarding, Crewmute uses **UPI Deep Linking**.
- When a ride request is accepted, a "Pay UPI" button appears for the passenger.
- Tapping it triggers a native deep link (`upi://pay?pa=...`) that instantly opens the user's installed UPI app (Google Pay, PhonePe, Paytm).
- The transaction amount and the driver's UPI ID are pre-filled. The transaction settles instantly, offline, with absolutely zero platform fees.

### 2.5 Real-Time Communication (Socket.io)
- **1:1 Chat**: Passengers can securely chat with the poster to iron out pickup details once accepted.
- **Group Chat**: If a ride has multiple passengers, they are all routed into a unified Socket.io room (`ride_group_{id}`), creating a temporary group chat for that specific journey.

### 2.6 Advanced Safety (Live Tracking & SOS)
- **Live GPS Broadcasting**: When the journey begins, the poster's phone runs a foreground location service. It broadcasts coordinates via WebSockets to the server, which relays them to the passengers' maps in real-time.
- **1-Tap SOS**: A prominent emergency button. Triggering it immediately opens the native SMS app pre-filled with a Google Maps link to their live location, while simultaneously firing backend push notifications and emails to their saved emergency contacts.

---

## 3. Technical Architecture & Stack

### 3.1 Mobile Frontend (React Native / Expo)
- **Framework**: Expo SDK (Managed Workflow) allows for rapid compilation and Over-The-Air (OTA) updates.
- **Styling**: `NativeWind` (Tailwind CSS for React Native) ensures styling is consistent, responsive, and easy to maintain.
- **State Management**: 
  - `Zustand` handles global client state (Auth tokens, user profile).
  - `React Query (@tanstack/react-query)` handles all server state, providing built-in caching, request deduplication, and optimistic UI updates.
- **Navigation**: `Expo Router` (file-based routing) provides deep linking capabilities out of the box, essential for push notification routing.

### 3.2 Backend API (Node.js / Express)
- **Architecture**: A modular, feature-based directory structure (e.g., `src/features/rides`, `src/features/auth`) ensuring the codebase scales predictably.
- **Database**: `MongoDB` via `Mongoose`. Schemas utilize compound indexes (e.g., `{fromCity: 1, toCity: 1, departureDate: 1}`) to ensure queries resolve in milliseconds, even with thousands of concurrent rides.
- **Authentication**: JWT (JSON Web Tokens). A dual-token system (short-lived Access Token + long-lived HTTP-only Refresh Token) provides high security against XSS while maintaining persistent logins. Password hashing is done via `bcrypt`.
- **Validation**: `express-validator` and `zod` guarantee that malformed or malicious data never reaches the database.

### 3.3 Real-Time Infrastructure (Socket.io)
- The WebSocket server is authenticated via JWT handshakes to prevent unauthorized connections.
- It leverages Socket.io's "Rooms" feature extensively. When a user opens a chat, they join a specific room (`chat_userA_userB` or `ride_group_123`). This ensures O(1) message routing efficiency—the server only broadcasts payloads to the specific clients currently subscribed to that room.

### 3.4 Web Admin Dashboard (Next.js)
- **Framework**: Next.js App Router.
- **UI Components**: `shadcn/ui` + Tailwind CSS.
- **Data Fetching**: React Query fetching from the same Node.js API, authenticated via a dedicated `ADMIN` role embedded in the JWT payload.

---

## 4. Notable Engineering Highlights

1. **Zero-Friction Economics**: By sidestepping traditional Payment Gateways in favor of UPI Deep Links, the app bypasses grueling KYC/merchant onboarding processes and saves students from paying 2-3% platform transaction fees.
2. **Graceful Degradation for iOS/Android**: The app uses advanced UI techniques like iOS's `BlurView` (Liquid Glass) for the tab bar. Because this drops frames on mid-range Android devices, the code actively detects the OS and falls back to a highly optimized, solid color hex on Android to maintain a strict 60 FPS.
3. **Compound Database Indexing**: To support rapid searching of rides across specific dates and routes, MongoDB compound indexes were crafted. A query for "Delhi to Chandigarh on 24th July" scans only the relevant subset of B-Trees, bypassing slow full-collection scans entirely.
4. **Resilient Sockets**: The Socket.io client is configured with custom retry logic and exponential backoff. If a student's network drops while their cab drives through a tunnel, the socket automatically queues messages locally and flushes them to the server the moment LTE is restored.
