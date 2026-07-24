CREWMUTE
Campus Carpool App

Product Requirements Document
Version 2.0  •  July 2026
Pahul  •  Amity University Punjab

CONFIDENTIAL — INTERNAL USE ONLY

---

## 1. Executive Summary
Crewmute is a mobile-first carpool platform designed specifically for Indian college students who travel home on weekends and holidays. Students currently rely on fragmented WhatsApp groups and personal networks to find co-passengers for shared cabs — a process that is slow, unreliable, and limited to existing contacts.

Crewmute solves this by providing a structured, trusted platform where students can post rides or browse available seats, coordinate with verified co-passengers, split cab costs transparently via direct UPI payments, and travel safely with live tracking and SOS features — all from a single mobile app.

**Problem Statement**
Every weekend, thousands of Indian college students travel home via shared cabs. Finding co-passengers today means posting in WhatsApp groups, waiting for responses, coordinating manually, and hoping the timing aligns. There is no dedicated product for this specific use case — intercity student travel to home cities on weekends and holidays.

**Solution**
A comprehensive full-stack ecosystem:
1. **Mobile App (React Native/Expo)** for students (iOS/Android) to discover rides, coordinate, and pay.
2. **Backend API (Node.js/Express/MongoDB)** to power the platform.
3. **Web Admin Dashboard** for platform moderators to verify student IDs and manage users/rides.

**Target Users**
- Indian college students aged 18–24
- Traveling intercity to home cities on weekends and public holidays
- Seeking to reduce cost and find trusted co-passengers

---

## 2. Goals & Success Metrics

**2.1 Product Goals**
- Enable students to find verified co-passengers for intercity weekend travel.
- Facilitate seamless P2P payments (UPI deep linking) to reduce friction in cost splitting.
- Ensure passenger safety with Live Ride Tracking, SOS features, and strict student verification.
- Deliver a premium, production-ready product ready for public launch.

**2.2 Technical Goals**
- Build a complete, scalable REST API using Node.js, Express, and MongoDB.
- Deliver a performant React Native application using Expo and NativeWind.
- Implement real-time features using Socket.io (Chats, Live Location).
- Build a secure, decoupled Web Admin Dashboard for moderation.

---

## 3. Product Scope

### 3.1 Authentication & Trust (Core)
- Register with college email (auto-verified via email OTP).
- Fallback: Upload student ID photo for manual admin verification (via Web Dashboard).
- Profile setup: name, college, home city, profile photo.
- Reviews and ratings for users to build a trust system.

### 3.2 Ride Management & Discovery
- **Post Ride:** Specify route, date, time, total seats, cab type, and fare per seat.
- **Search:** Browse rides filtered by route and date with Google Places autocomplete.
- **Auto-expiration:** Rides automatically expire after the departure time.

### 3.3 Ride Requests & Coordination
- **Requests:** Requesters send seat requests; Posters accept or reject.
- **Seat Counter:** Real-time seat updates upon acceptance.
- **Group Chat:** 1:1 chat before the ride is fully booked, evolving into a Group Chat for rides with 3+ passengers to coordinate pickups.

### 3.4 Payments
- **Cost Split Calculator:** Auto-calculates per-person share.
- **P2P UPI Deep Linking:** Direct "Pay via UPI" button in the app that opens the user's installed UPI app (GPay, PhonePe, Paytm) pre-filled with the poster's `upiId` and exact fare. *No merchant onboarding required.*

### 3.5 Safety & Tracking
- **Live Ride Tracking:** Integration with Google Maps to share and view real-time cab location.
- **SOS / Emergency Contacts:** In-app SOS button to instantly alert pre-saved emergency contacts and campus authorities with the user's live location and ride details.

### 3.6 Moderation & Administration
- **Web Admin Dashboard:** A standalone React/Next.js web application for admins.
- **Capabilities:** Approve/Reject manual Student ID uploads, view platform metrics, manage reported users, and oversee active SOS alerts.

---

## 4. User Personas

**Persona 1 — The Weekend Traveler (Driver/Cab Booker)**
- **Name:** Arjun, 20
- **Problem:** Travels home every 2–3 weekends. Books a cab for ₹3000 but struggles to find people to split the cost on WhatsApp.
- **Goal:** Post a ride, get 3 co-passengers, automatically collect their share via UPI.

**Persona 2 — The Holiday Planner (Passenger)**
- **Name:** Priya, 21
- **Problem:** Plans travel 3–4 days in advance. Safety is a priority; she wants to know her co-passengers are verified students.
- **Goal:** Book a confirmed seat early, know who she's traveling with, and share her live location with her parents.

**Persona 3 — The Moderator (Admin)**
- **Name:** Rahul, 23 (Campus Ambassador / Admin)
- **Problem:** Needs an efficient way to verify users who don't have `.edu.in` emails.
- **Goal:** Log into the Web Dashboard, review pending student ID cards, and approve them with one click.

---

## 5. Feature Requirements & Technical Details

### 5.1 Mobile App Features

| Feature | Description | Status |
|---|---|---|
| **Auth & Profiles** | Email OTP registration, JWT sessions, Cloudinary avatar uploads. | ✅ Completed |
| **Student Verification**| Users without college emails upload their ID for admin review. | 🟡 In Progress |
| **Ride CRUD** | Post, Edit, Cancel rides. Auto-expire rides after departure. | ✅ Completed |
| **Ride Discovery** | Filter by Route/Date. Google Places Autocomplete. | ✅ Completed |
| **Requests Engine** | Send, Accept, Reject, Withdraw requests. Real-time seat counts. | ✅ Completed |
| **UPI Payments** | Direct P2P UPI payments via `upi://pay` deep linking. | ✅ Completed |
| **Chat System** | 1:1 messaging via Socket.io. Read receipts. | ✅ Completed |
| **Group Chats** | Multi-user chat rooms for accepted passengers on a single ride. | ⏳ Planned |
| **SOS System** | One-tap emergency alert sharing live location via SMS/WhatsApp. | ⏳ Planned |
| **Live Tracking** | Real-time GPS broadcasting from Poster to Passengers. | ⏳ Planned |

### 5.2 Web Admin Dashboard Features

| Feature | Description | Priority |
|---|---|---|
| **Admin Login** | Secure login for staff/moderators (Role-Based Access). | P0 |
| **ID Verification Queue**| Table view of pending user registrations awaiting Student ID approval. | P0 |
| **User Management** | View, suspend, or ban users for community guideline violations. | P1 |
| **Ride Oversight** | View active rides, historical rides, and platform statistics. | P1 |

---

## 6. Tech Stack

### 6.1 Mobile (Frontend)
- **Framework:** React Native 0.74+ / Expo SDK 51+
- **Styling:** NativeWind v4 (Tailwind CSS)
- **Navigation:** Expo Router v3
- **State Management:** Zustand, React Query
- **Maps/Location:** `react-native-maps`, `expo-location`
- **Real-time:** `socket.io-client`

### 6.2 Backend (API)
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Database:** MongoDB 7.x + Mongoose
- **Real-time:** Socket.io
- **Auth:** JWT (Access/Refresh), bcrypt

### 6.3 Web Admin Dashboard
- **Framework:** React + Next.js (or Vite)
- **Styling:** Tailwind CSS / shadcn-ui
- **State:** React Query

### 6.4 Infrastructure & APIs
- **Hosting:** Railway (Backend), Vercel (Admin Web)
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary (Images)
- **External APIs:** Google Places API, Google Maps Directions API

---

## 7. Build Timeline & Roadmap

**Phase 1: Foundation & P2P UPI (Completed)**
- Core API & Database.
- Mobile Auth, Ride Discovery, Request Engine, and 1:1 Chat.
- Direct P2P UPI Payments via Deep Linking.

**Phase 2: Group Chats & SOS (Upcoming)**
- Upgrade Socket.io backend to support multi-user rooms.
- Implement Mobile UI for Group Chats.
- Implement SOS button and emergency contact saving.

**Phase 3: Live Ride Tracking (Upcoming)**
- Background location tracking (Poster).
- Real-time location broadcasting via Socket.io.
- Map UI for passengers to track the ride.

**Phase 4: Web Admin Dashboard (Upcoming)**
- Initialize React/Next.js web app.
- Implement Admin Auth & RBAC in backend.
- Build Student ID Verification queue and User Management tools.

---

## 8. Non-Functional Requirements

- **Performance:** API response time < 300ms. Mobile app should maintain 60fps, especially on Map screens.
- **Security:** All endpoints protected by JWT. Web Admin uses strict RBAC (Role-Based Access Control). Passwords hashed with bcrypt.
- **Reliability:** Socket connections must handle reconnects gracefully during mobile network drops (e.g., when a train passes through a tunnel or on the highway).
