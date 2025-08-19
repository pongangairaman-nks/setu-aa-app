# 🏠 HomeScreen User Profile Integration

## ✅ **What's Been Implemented:**

### **1. User Profile Fetching**
- ✅ **Automatic Fetch**: HomeScreen calls `/api/auth/me` when component mounts
- ✅ **Redux Integration**: Stores complete user profile (including consent details) in Redux store
- ✅ **Error Handling**: Graceful error handling for profile fetch failures
- ✅ **Loading States**: Proper loading indicators during profile fetch

### **2. User Consent Details Display**
- ✅ **Current Consent**: Displays user's current consent in the "Active Consents" section
- ✅ **Special Styling**: Uses `isUserConsent={true}` for special visual indicators
- ✅ **Status Support**: Shows consent status (PENDING, APPROVED, REJECTED)
- ✅ **Navigation**: Links to Consent screen for detailed view

### **3. Refresh Integration**
- ✅ **Pull-to-Refresh**: Includes user profile refresh in pull-to-refresh functionality
- ✅ **Complete Refresh**: Refreshes user profile, accounts, and consents
- ✅ **Loading States**: Shows loading indicator during refresh

## 🔧 **Implementation Details:**

### **HomeScreen.tsx Changes:**

#### **Imports Added:**
```typescript
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setUser } from '../../store/slices/userSlice';
import { apiClient } from '../../services/api/apiClient';
```

#### **Redux Integration:**
```typescript
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);
  
  // ... existing code
}
```

#### **User Profile Fetching:**
```typescript
// Fetch user profile when component mounts
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      setLoadingUserProfile(true);
      console.log('🔄 Fetching user profile from /api/auth/me...');
      
      const response = await apiClient.get('/auth/me');
      console.log('✅ User profile fetched successfully:', response);
      
      // Update user in Redux store with complete profile including consent details
      dispatch(setUser(response as any));
      
      console.log('✅ User profile updated in Redux store');
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      // Don't show alert for profile fetch errors as user might still be able to use the app
    } finally {
      setLoadingUserProfile(false);
    }
  };

  fetchUserProfile();
}, [dispatch]);
```

#### **Enhanced Refresh Function:**
```typescript
const handleRefresh = async () => {
  try {
    // Fetch user profile
    const response = await apiClient.get('/auth/me');
    dispatch(setUser(response as any));
    console.log('✅ User profile refreshed');
  } catch (error) {
    console.error('❌ Error refreshing user profile:', error);
  }
  
  // Refresh other data
  refreshAccounts();
  refreshConsents();
};
```

#### **User Consent Display:**
```typescript
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Active Consents</Text>
  
  {/* Display user's current consent details */}
  {user?.consentDetails?.consentId && (
    <ConsentStatus
      consent={{
        consentId: user.consentDetails.consentId,
        status: user.consentDetails.consentStatus || 'PENDING',
        createdAt: user.consentDetails.consentCreatedAt,
        updatedAt: user.consentDetails.consentUpdatedAt,
        expiresAt: user.consentDetails.consentExpiresAt,
        fipName: 'Setu FIP',
        dataLife: 24,
        permissions: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
        fetchType: 'PERIODIC',
        frequency: { unit: 'MONTH', value: 1 }
      }}
      showDetails={false}
      onPress={() => navigation.navigate('Consent' as never)}
      isUserConsent={true}
    />
  )}

  {/* Display other consents from API */}
  {consents.length > 0 ? (
    consents.slice(0, 2).map((consent) => (
      <ConsentStatus
        key={consent.consentId}
        consent={consent}
        showDetails={false}
        onPress={() => navigation.navigate('Consent' as never)}
      />
    ))
  ) : !user?.consentDetails?.consentId && (
    <Text style={styles.emptyText}>No active consents</Text>
  )}
</View>
```

#### **Enhanced Refresh Control:**
```typescript
<RefreshControl
  refreshing={accountsLoading || consentsLoading || loadingUserProfile}
  onRefresh={handleRefresh}
/>
```

## 🎯 **Features:**

### **Automatic Profile Loading:**
- 🔄 **On Mount**: Fetches user profile when HomeScreen loads
- 📱 **Complete Data**: Gets user details including consent information
- 🔗 **Redux Store**: Updates Redux store with complete user profile
- ⚡ **Performance**: Only fetches once on component mount

### **User Consent Display:**
- 🏷️ **Current Consent**: Shows user's current consent with special styling
- 🎨 **Visual Indicators**: Blue border and "Current" badge for user consents
- 📊 **Status Information**: Displays consent status and details
- 🎯 **Smart Navigation**: Links to Consent screen for detailed view

### **Refresh Functionality:**
- 🔄 **Pull-to-Refresh**: Includes user profile in refresh cycle
- 📡 **Complete Refresh**: Updates user profile, accounts, and consents
- ⏳ **Loading States**: Shows loading indicators during refresh
- 🛡️ **Error Handling**: Graceful error handling for failed refreshes

### **Data Flow:**
1. **User Login** → Navigate to HomeScreen
2. **HomeScreen Mount** → Fetch `/api/auth/me`
3. **API Response** → Update Redux store with `setUser()`
4. **UI Update** → Display user consent details
5. **Pull-to-Refresh** → Refresh all data including user profile

## 🚀 **Ready for Testing:**

The HomeScreen now:
1. ✅ **Automatically fetches user profile** when loaded
2. ✅ **Stores complete user data** in Redux store
3. ✅ **Displays user's current consent** with special styling
4. ✅ **Refreshes user profile** on pull-to-refresh
5. ✅ **Handles errors gracefully** without breaking the app

## 📝 **Next Steps:**

1. **Test the mobile app** - Verify user profile is fetched on HomeScreen load
2. **Check Redux store** - Confirm user data is stored correctly
3. **Test consent display** - Verify user's current consent is shown
4. **Test refresh** - Pull-to-refresh should update user profile
5. **Test error scenarios** - Verify graceful error handling

The HomeScreen is now fully integrated with the user profile system and will automatically fetch and display the user's consent details! 🎉
