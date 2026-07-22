
CREWMUTE
Campus Carpool App


Technical Architecture Document
Version 1.0  •  June 2026
Pahul  •  Amity University Punjab

CONFIDENTIAL — INTERNAL USE ONLY
 
1. System Overview
Crewmute is a mobile-first application consisting of two primary components: a React Native (Expo) mobile client targeting Android and iOS, and a RESTful Node.js/Express backend with Socket.io for real-time features. The system is stateless at the API layer, with all persistence handled by MongoDB Atlas and media by Cloudinary.

1.1 High-Level Architecture
Layer	Technology	Responsibility
Mobile Client	React Native + Expo SDK	UI, navigation, local state, push notifications
API Server	Node.js + Express.js	Business logic, auth, REST endpoints, Socket.io
Database	MongoDB Atlas (Mongoose)	All persistent data: users, rides, requests, messages
Real-time	Socket.io	Live chat, seat count updates, notification events
Media Storage	Cloudinary	Profile photos, student ID uploads
Push Notifications	Expo Push Notification Service	FCM/APNs delivery via Expo
Maps & Places	Google Places API	City autocomplete in ride forms
Deployment	Railway (backend) + EAS (mobile)	Production hosting and app builds

1.2 Communication Flow
•	Mobile client communicates with backend over HTTPS REST (Axios)
•	Real-time chat and seat updates use WebSocket via Socket.io
•	Push notifications flow: server triggers Expo Push API → Expo routes to FCM (Android) or APNs (iOS)
•	Media uploads: client uploads directly to Cloudinary via signed URL, stores URL in MongoDB

 
2. Repository Structure
2.1 Backend — crewmute-api
crewmute-api/
├── src/
│   ├── config/          # DB connection, env validation, constants
│   ├── controllers/     # Route handler logic (thin, delegates to services)
│   ├── middleware/       # auth, errorHandler, rateLimiter, validate
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express router definitions
│   ├── services/        # Business logic (auth, rides, chat, notifications)
│   ├── sockets/         # Socket.io event handlers
│   └── utils/           # Helpers: jwt, email, cloudinary, costCalc
├── .env.example
├── .gitignore
├── package.json
└── server.js            # Entry point

2.2 Mobile — crewmute-app
crewmute-app/
├── app/                 # Expo Router — file-based routes
│   ├── (auth)/          # Login, Register, OTP, Profile Setup screens
│   ├── (tabs)/          # Home feed, My Rides, Profile tabs
│   ├── ride/            # [id].tsx — Ride detail screen
│   ├── chat/            # [id].tsx — Chat screen
│   └── _layout.tsx      # Root layout, auth guard
├── components/          # Reusable UI components
│   ├── RideCard.tsx
│   ├── RequestCard.tsx
│   ├── ChatBubble.tsx
│   └── ...
├── hooks/               # useAuth, useSocket, useRides, usePushNotif
├── lib/                 # axios instance, socket client, storage
├── store/               # Zustand global state
├── types/               # TypeScript interfaces
├── constants/           # Colors, routes, config
├── app.json
└── package.json

 
3. Database Schema
All collections are stored in MongoDB Atlas. Mongoose is used as the ODM. Relationships are handled via ObjectId references with selective population.

3.1 Users Collection
users
Field	Type	Required	Notes
_id	ObjectId	Auto	MongoDB default
name	String	Yes	Full name, trimmed
email	String	Yes	Unique, lowercase, indexed
password	String	Yes	bcrypt hash, never returned in queries
college	String	Yes	Free text college name
homeCity	String	Yes	Default destination city
profilePhoto	String	No	Cloudinary URL
studentIdPhoto	String	No	Cloudinary URL — fallback verification
isVerified	Boolean	Yes	Default false, true after OTP
verificationMethod	String (enum)	Yes	'email' | 'studentId'
expoPushToken	String	No	Updated on each app login
refreshTokens	String[]	Yes	Array of valid refresh tokens
otp	String	No	Hashed OTP, cleared after verification
otpExpiry	Date	No	OTP expiry (10 min from generation)
createdAt	Date	Auto	Mongoose timestamps
updatedAt	Date	Auto	Mongoose timestamps

3.2 Rides Collection
rides
Field	Type	Required	Notes
_id	ObjectId	Auto	
poster	ObjectId (ref: User)	Yes	Indexed — ride creator
fromCity	String	Yes	Indexed for route queries
toCity	String	Yes	Indexed for route queries
departureDate	Date	Yes	Indexed for date filtering
departureTime	String	Yes	'HH:MM' format
totalSeats	Number	Yes	Min 1, max 6
availableSeats	Number	Yes	Decrements on request acceptance
farePerSeat	Number	Yes	In INR
cabType	String	No	'Sedan' | 'SUV' | 'Auto' | 'Other'
status	String (enum)	Yes	'active' | 'full' | 'cancelled' | 'expired'
notes	String	No	Optional note from poster, max 200 chars
createdAt / updatedAt	Date	Auto	Mongoose timestamps
Indexes: { fromCity, toCity, departureDate } compound index for route+date queries. { poster } for My Rides. { status } for feed filtering.

3.3 Requests Collection
requests
Field	Type	Required	Notes
_id	ObjectId	Auto	
ride	ObjectId (ref: Ride)	Yes	Indexed
requester	ObjectId (ref: User)	Yes	Indexed
status	String (enum)	Yes	'pending' | 'accepted' | 'rejected' | 'withdrawn'
message	String	No	Optional intro message, max 100 chars
createdAt / updatedAt	Date	Auto	Mongoose timestamps
Unique constraint: { ride, requester } — one request per user per ride.

3.4 Messages Collection
messages
Field	Type	Required	Notes
_id	ObjectId	Auto	
chat	ObjectId (ref: Chat)	Yes	Indexed
sender	ObjectId (ref: User)	Yes	
content	String	Yes	Max 1000 chars
readBy	ObjectId[]	Yes	Array of user IDs who read the message
createdAt	Date	Auto	Used for message ordering

3.5 Chats Collection
chats
Field	Type	Required	Notes
_id	ObjectId	Auto	
ride	ObjectId (ref: Ride)	Yes	Parent ride context
participants	ObjectId[] (ref: User)	Yes	Always [poster, requester]
lastMessage	ObjectId (ref: Message)	No	For chat list preview
createdAt / updatedAt	Date	Auto	Mongoose timestamps
A chat is created automatically when a request is accepted. Unique constraint: { ride, participants } sorted.

 
4. API Endpoints
Base URL: https://crewmute-api.railway.app/api/v1
All protected routes require Authorization: Bearer <access_token> header.

4.1 Auth Routes — /auth
Method	Endpoint	Auth	Description
POST	/auth/register	Public	Register with email, name, college, homeCity, password. Sends OTP.
POST	/auth/verify-otp	Public	Verify email OTP. Returns access + refresh tokens.
POST	/auth/login	Public	Email + password login. Returns access + refresh tokens.
POST	/auth/refresh	Public	Exchange refresh token for new access token.
POST	/auth/logout	Protected	Invalidate refresh token.
POST	/auth/upload-student-id	Protected	Upload student ID photo to Cloudinary. Sets verificationMethod.

4.2 User Routes — /users
Method	Endpoint	Auth	Description
GET	/users/me	Protected	Get current user profile.
PATCH	/users/me	Protected	Update name, homeCity, profilePhoto.
GET	/users/:id	Protected	Get public profile of another user (name, college, homeCity, photo only).
PATCH	/users/me/push-token	Protected	Update Expo push token on login.

4.3 Ride Routes — /rides
Method	Endpoint	Auth	Description
GET	/rides	Protected	List active rides. Query: fromCity, toCity, date, page, limit.
POST	/rides	Protected	Create a new ride.
GET	/rides/:id	Protected	Get single ride with poster info and available seats.
PATCH	/rides/:id	Protected	Update ride (poster only). farePerSeat or notes only before requests.
DELETE	/rides/:id	Protected	Cancel ride (poster only). Notifies all requestors.
GET	/rides/my/posted	Protected	Get rides posted by current user.
GET	/rides/my/joined	Protected	Get rides current user has been accepted into.

4.4 Request Routes — /requests
Method	Endpoint	Auth	Description
POST	/requests	Protected	Send a seat request. Body: { rideId, message? }.
GET	/requests/ride/:rideId	Protected	Get all requests for a ride (poster only).
GET	/requests/my	Protected	Get all requests sent by current user.
PATCH	/requests/:id/accept	Protected	Accept a request (poster only). Decrements availableSeats. Creates chat.
PATCH	/requests/:id/reject	Protected	Reject a request (poster only).
DELETE	/requests/:id	Protected	Withdraw a pending request (requester only).

4.5 Chat Routes — /chats
Method	Endpoint	Auth	Description
GET	/chats	Protected	Get all chats for current user.
GET	/chats/:id/messages	Protected	Get paginated messages for a chat. Query: page, limit.
POST	/chats/:id/read	Protected	Mark all unread messages in chat as read.
Note: Messages are sent via Socket.io, not REST. REST endpoints are for loading history only.

 
5. Real-time Architecture (Socket.io)
Socket.io runs on the same Express server. On connection, the client authenticates by sending its JWT access token. The server validates the token and attaches the user object to the socket.

5.1 Connection & Auth
// Client connects with auth token
const socket = io(API_URL, {
  auth: { token: accessToken },
  transports: ['websocket']
});

// Server middleware validates token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyAccessToken(token);
  if (!user) return next(new Error('Unauthorized'));
  socket.user = user;
  next();
});

5.2 Rooms
Room Name	Format	Purpose
User room	user:{userId}	Personal notifications (request received, accepted, rejected)
Chat room	chat:{chatId}	Real-time messages between matched riders
Ride room	ride:{rideId}	Seat count updates for all viewers of a ride

5.3 Socket Events
Direction	Event	Payload	Description
Client → Server	join:chat	{ chatId }	Join a chat room after acceptance
Client → Server	send:message	{ chatId, content }	Send a chat message
Client → Server	read:messages	{ chatId }	Mark chat messages as read
Client → Server	join:ride	{ rideId }	Subscribe to seat count updates for a ride
Server → Client	new:message	{ message object }	Broadcast new message to chat room
Server → Client	messages:read	{ chatId, userId }	Notify sender their messages were read
Server → Client	seats:updated	{ rideId, availableSeats }	Live seat count change
Server → Client	request:received	{ request object }	Notify poster of new seat request
Server → Client	request:updated	{ requestId, status }	Notify requester of accept/reject

6. Authentication Flow
6.1 Token Strategy
•	Access token: JWT, signed with ACCESS_SECRET, expires in 15 minutes
•	Refresh token: JWT, signed with REFRESH_SECRET, expires in 7 days
•	Refresh tokens stored as an array in the User document (supports multi-device)
•	On logout: refresh token removed from array — token rotation on each refresh

6.2 Registration Flow
Step	Action	Detail
1	POST /auth/register	Validate inputs. Check email uniqueness. Hash password with bcrypt (rounds: 12).
2	Generate OTP	6-digit OTP, hashed with bcrypt before storing. Expiry: 10 minutes.
3	Send OTP email	Nodemailer sends OTP to college email. User saved with isVerified: false.
4	POST /auth/verify-otp	Compare submitted OTP against stored hash. Check expiry.
5	Verify success	Set isVerified: true. Clear OTP fields. Return access + refresh tokens.

6.3 Student ID Fallback
•	User registers without college email (uses personal email)
•	After registration, uploads student ID photo via POST /auth/upload-student-id
•	Photo stored in Cloudinary under /crewmute/student-ids/ folder
•	verificationMethod set to 'studentId', isVerified set to true immediately for MVP
Note: For MVP, student ID upload is self-serve trust. Post-MVP, manual review or AI verification can be added.

 
7. Key Business Logic
7.1 Accept Request — Atomic Operation
When a poster accepts a request, three things must happen atomically to prevent race conditions:
•	Request status updated to 'accepted'
•	Ride's availableSeats decremented by 1
•	If availableSeats reaches 0, ride status set to 'full'
•	Chat document created between poster and requester
Implementation: Use a MongoDB session (transaction) wrapping the above operations. If any step fails, the entire transaction rolls back.

7.2 Cost Split Calculator
// costCalc.js utility
function calculateFarePerSeat(totalFare, seats) {
  return Math.ceil(totalFare / seats); // Round up to nearest rupee
}

function calculateTotalFare(farePerSeat, seats) {
  return farePerSeat * seats;
}

7.3 Ride Auto-expiry
•	A cron job runs every 30 minutes (node-cron)
•	Queries rides where departureDate < now AND status is 'active' or 'full'
•	Updates matching rides to status: 'expired'
•	Expired rides are excluded from the feed but remain in My Rides history

7.4 Push Notification Service
// notifications.js
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(expoPushToken, title, body, data) {
  if (!Expo.isExpoPushToken(expoPushToken)) return;
  const message = { to: expoPushToken, sound: 'default', title, body, data };
  await expo.sendPushNotificationsAsync([message]);
}

Notifications triggered on:
•	New seat request → poster notified
•	Request accepted → requester notified
•	Request rejected → requester notified
•	Ride cancelled → all accepted requestors notified
•	New chat message → recipient notified if app is backgrounded

 
8. Environment Variables
8.1 Backend (.env)
Variable	Example	Purpose
PORT	5000	Express server port
MONGO_URI	mongodb+srv://...	MongoDB Atlas connection string
ACCESS_TOKEN_SECRET	random 64-char string	JWT access token signing key
REFRESH_TOKEN_SECRET	random 64-char string	JWT refresh token signing key
EMAIL_HOST	smtp.gmail.com	Nodemailer SMTP host
EMAIL_USER	crewmute@gmail.com	Sender email address
EMAIL_PASS	app password	Gmail app password
CLOUDINARY_CLOUD_NAME	crewmute	Cloudinary account name
CLOUDINARY_API_KEY	...	Cloudinary API key
CLOUDINARY_API_SECRET	...	Cloudinary API secret
CLIENT_URL	exp://...	Mobile app URL for CORS
NODE_ENV	production	'development' | 'production'

8.2 Mobile (app.config.js)
Variable	Purpose
EXPO_PUBLIC_API_URL	Backend base URL (Railway production URL)
EXPO_PUBLIC_GOOGLE_PLACES_KEY	Google Places API key for city autocomplete

9. DevOps & Deployment
9.1 GitHub Strategy
•	Two repos: crewmute-api (backend) and crewmute-app (mobile)
•	Branch strategy: main (production), dev (integration), feature/* (individual features)
•	All feature branches PR into dev. Dev merged into main on weekly milestone completion.
•	Commit convention: feat:, fix:, chore:, refactor: prefixes

9.2 GitHub Actions CI — Backend
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3 (node 20)
      - run: npm ci
      - run: npm run lint
      - run: npm test

9.3 Railway Deployment
•	Connect Railway to crewmute-api GitHub repo
•	Auto-deploy on push to main branch
•	Environment variables set in Railway dashboard (not committed to repo)
•	Health check endpoint: GET /health → returns { status: 'ok', uptime }
•	UptimeRobot pings /health every 5 minutes to prevent cold starts on free tier

9.4 Expo EAS Build
•	eas build --platform android → APK for beta testing
•	eas build --platform ios → IPA for TestFlight
•	eas.json defines build profiles: development, preview, production
•	OTA updates via expo-updates for JS-only changes post-launch

 
10. Security Checklist
Security Measure	Status	Layer
Passwords hashed with bcrypt (rounds: 12)	MVP	Backend
JWT access tokens expire in 15 minutes	MVP	Backend
Refresh token rotation on each use	MVP	Backend
All inputs validated with express-validator	MVP	Backend
Rate limiting on auth endpoints (express-rate-limit)	MVP	Backend
CORS restricted to mobile app origin	MVP	Backend
Helmet.js security headers	MVP	Backend
Tokens stored in SecureStore on mobile (not AsyncStorage)	MVP	Mobile
User profile data restricted — public endpoint returns name/college/photo only	MVP	Backend
Cloudinary signed uploads (no public write access)	MVP	Backend
MongoDB Atlas IP allowlist (Railway static IP)	MVP	Infrastructure
Sentry error monitoring	Post-MVP	Backend

