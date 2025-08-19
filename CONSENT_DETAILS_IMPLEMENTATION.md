# 🏛️ Consent Details Implementation

## 📋 **Overview**

This implementation stores consent details (consent ID and status) directly in the user's profile, allowing each user to track their consent information throughout the consent flow.

## 🔧 **Implementation Details**

### **1. User Schema Updates**

**File**: `backend/src/models/User.js`

Added consent details fields to the User schema:

```javascript
consentDetails: {
  consentId: {
    type: String,
    default: null
  },
  consentStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
    default: null
  },
  consentCreatedAt: {
    type: Date,
    default: null
  },
  consentUpdatedAt: {
    type: Date,
    default: null
  },
  consentExpiresAt: {
    type: Date,
    default: null
  }
}
```

### **2. Frontend Type Updates**

**File**: `src/services/auth/authService.ts`

Updated User interface to include consent details:

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  consentDetails?: {
    consentId: string | null;
    consentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | null;
    consentCreatedAt: string | null;
    consentUpdatedAt: string | null;
    consentExpiresAt: string | null;
  };
}
```

### **3. Redux Store Updates**

**File**: `src/store/slices/userSlice.ts`

Added new action to update consent details:

```typescript
updateConsentDetails: (state, action: PayloadAction<{
  consentId: string;
  consentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  consentCreatedAt?: string;
  consentUpdatedAt?: string;
  consentExpiresAt?: string;
}>) => {
  if (state.user) {
    state.user.consentDetails = {
      ...state.user.consentDetails,
      ...action.payload,
      consentUpdatedAt: action.payload.consentUpdatedAt || new Date().toISOString()
    };
  }
}
```

### **4. Frontend Consent Creation**

**File**: `src/screens/ConsentScreen/ConsentScreen.tsx`

Updated consent creation to store consent details before opening WebView:

```typescript
// Store consent details in user profile before opening WebView
if (consentRequest.id && user) {
  console.log('📋 Storing consent details in user profile...');
  dispatch(updateConsentDetails({
    consentId: consentRequest.id,
    consentStatus: 'PENDING',
    consentCreatedAt: new Date().toISOString(),
    consentUpdatedAt: new Date().toISOString(),
    consentExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  }));
  console.log('✅ Consent details stored in user profile');
}
```

### **5. Backend Callback Updates**

**File**: `backend/src/controllers/consentController.js`

Updated callback to update user's consent details when webhook is received:

```javascript
// Update user's consent details
try {
  // Find user by consent ID and update their consent details
  const user = await User.findOneAndUpdate(
    { 'consentDetails.consentId': consentId },
    {
      'consentDetails.consentStatus': status === "true" ? "APPROVED" : "REJECTED",
      'consentDetails.consentUpdatedAt': new Date()
    },
    { new: true }
  );

  if (user) {
    logger.info(`User consent details updated: ${user.email} -> ${status === "true" ? "APPROVED" : "REJECTED"}`);
  } else {
    logger.warn(`No user found with consent ID: ${consentId}`);
  }
} catch (error) {
  logger.error('Error updating user consent details:', error);
}
```

### **6. API Endpoint Updates**

**File**: `backend/src/routes/userAuthRoutes.js`

Updated `/api/auth/me` endpoint to include consent details:

```javascript
const userResponse = {
  id: req.user._id,
  email: req.user.email,
  name: req.user.name,
  createdAt: req.user.createdAt,
  consentDetails: req.user.consentDetails || null
};
```

## 🔄 **Flow Summary**

### **Step 1: Consent Creation**
1. User clicks "Create New Consent"
2. Frontend calls Setu API to create consent
3. **NEW**: Frontend stores consent ID and status as "PENDING" in user's profile
4. WebView opens for consent flow

### **Step 2: Consent Approval/Rejection**
1. User completes consent flow in WebView
2. Setu sends webhook to backend callback URL
3. **NEW**: Backend updates user's consent details to "APPROVED" or "REJECTED"
4. Frontend receives callback and shows appropriate message

### **Step 3: User Profile Access**
1. User can access their consent details via `/api/auth/me` endpoint
2. Frontend can display consent status in user profile
3. Consent details are persisted in user's profile

## 📊 **Data Structure**

### **User Profile with Consent Details**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "consentDetails": {
    "consentId": "consent_uuid",
    "consentStatus": "APPROVED",
    "consentCreatedAt": "2025-08-19T07:30:00.000Z",
    "consentUpdatedAt": "2025-08-19T07:35:00.000Z",
    "consentExpiresAt": "2025-08-20T07:30:00.000Z"
  }
}
```

## 🎯 **Benefits**

1. **User-Centric**: Each user has their own consent tracking
2. **Real-time Updates**: Consent status is updated immediately when webhook is received
3. **Persistent Storage**: Consent details are stored in user's profile
4. **Easy Access**: Consent details are available via existing user API endpoints
5. **Status Tracking**: Complete consent lifecycle tracking (PENDING → APPROVED/REJECTED)

## 🚀 **Usage**

### **Frontend - Get User with Consent Details**
```typescript
const user = useSelector((state: RootState) => state.user.user);
console.log('User consent status:', user?.consentDetails?.consentStatus);
```

### **Backend - Get User with Consent Details**
```javascript
GET /api/auth/me
// Returns user object with consentDetails field
```

### **Frontend - Update Consent Details**
```typescript
dispatch(updateConsentDetails({
  consentId: 'consent_uuid',
  consentStatus: 'PENDING',
  consentCreatedAt: new Date().toISOString()
}));
```

## ✅ **Status**

- ✅ User schema updated with consent details
- ✅ Frontend types updated
- ✅ Redux store updated with consent actions
- ✅ Frontend consent creation updated
- ✅ Backend callback updated
- ✅ API endpoints updated
- ✅ Backend deployed and tested
- ✅ Ready for production use
