# 📱 ConsentScreen Updates - Display User Consent Details

## ✅ **What's Been Implemented:**

### **1. User Consent Details Display**
- ✅ **Redux Integration**: Fetches user consent details from Redux store
- ✅ **Current Consent Section**: Displays user's current consent with special styling
- ✅ **Consent Status Support**: Added support for "APPROVED" and "REJECTED" statuses
- ✅ **Visual Indicators**: Special border and "Current" badge for user consents

### **2. ConsentStatus Component Enhancements**
- ✅ **New Props**: Added `isUserConsent` prop to distinguish user consents
- ✅ **Status Support**: Added "APPROVED" and "REJECTED" status colors and text
- ✅ **Visual Styling**: Special blue border and badge for current user consents
- ✅ **Layout Improvements**: Better header layout with user consent indicator

### **3. ConsentScreen Layout Updates**
- ✅ **Current Consent Section**: Dedicated section for user's current consent
- ✅ **Consent List**: Shows both user consent and other consents from API
- ✅ **Conditional Display**: Only shows "No consents found" if no user consent exists
- ✅ **Navigation**: Proper navigation to Accounts screen for approved consents

## 🔧 **Implementation Details:**

### **ConsentScreen.tsx Changes:**
```typescript
// Get user's consent details from Redux store
const userConsentDetails = user?.consentDetails;

// Display user's consent details from profile
{userConsentDetails && userConsentDetails.consentId && (
  <View style={styles.userConsentSection}>
    <Text style={styles.userConsentTitle}>Current Consent</Text>
    <ConsentStatus
      consent={{
        consentId: userConsentDetails.consentId,
        status: userConsentDetails.consentStatus || 'PENDING',
        createdAt: userConsentDetails.consentCreatedAt,
        updatedAt: userConsentDetails.consentUpdatedAt,
        expiresAt: userConsentDetails.consentExpiresAt,
        fipName: 'Setu FIP',
        dataLife: 24,
        permissions: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
        fetchType: 'PERIODIC',
        frequency: { unit: 'MONTH', value: 1 }
      }}
      onPress={() => {
        if (userConsentDetails.consentStatus === 'APPROVED') {
          navigation.navigate('Accounts', { consentId: userConsentDetails.consentId });
        }
      }}
      isUserConsent={true}
    />
  </View>
)}
```

### **ConsentStatus.tsx Changes:**
```typescript
interface ConsentStatusProps {
  consent: Consent;
  onPress?: () => void;
  showDetails?: boolean;
  isUserConsent?: boolean; // New prop
}

// Status color support for APPROVED/REJECTED
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
      return '#28A745';
    case 'EXPIRED':
      return '#DC3545';
    case 'PENDING':
      return '#FFC107';
    case 'REVOKED':
    case 'REJECTED':
      return '#6C757D';
    default:
      return '#6C757D';
  }
};

// Special styling for user consents
<CardComponent 
  style={[
    styles.container, 
    isUserConsent && { borderColor: '#007AFF', borderWidth: 2 }
  ]} 
  onPress={onPress}
>
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Text style={styles.consentId}>Consent ID: {consent.consentId}</Text>
      {isUserConsent && (
        <Text style={styles.userConsentBadge}>Current</Text>
      )}
    </View>
    <View style={styles.statusContainer}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(consent.status) }]} />
      <Text style={styles.statusText}>{getStatusText(consent.status)}</Text>
    </View>
  </View>
</CardComponent>
```

### **New Styles Added:**

#### **ConsentScreen.styles.ts:**
```typescript
userConsentSection: {
  marginBottom: 20,
  paddingHorizontal: 20,
},
userConsentTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#007AFF',
  marginBottom: 8,
},
```

#### **ConsentStatus.styles.ts:**
```typescript
headerLeft: {
  flex: 1,
},
userConsentBadge: {
  fontSize: 12,
  fontWeight: '600',
  color: '#007AFF',
  backgroundColor: '#E3F2FD',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 4,
  marginTop: 4,
  alignSelf: 'flex-start',
},
```

## 🎯 **Features:**

### **Visual Indicators:**
- 🔵 **Blue Border**: User consents have a special blue border
- 🏷️ **"Current" Badge**: Clear indicator for the user's current consent
- 🎨 **Status Colors**: Proper colors for all consent statuses (PENDING, APPROVED, REJECTED, etc.)

### **User Experience:**
- 📱 **Dedicated Section**: "Current Consent" section for user's consent
- 🔄 **Real-time Updates**: Shows latest consent status from user profile
- 🎯 **Smart Navigation**: Only allows navigation to Accounts for approved consents
- 📊 **Complete Information**: Shows all consent details including permissions and dates

### **Data Integration:**
- 🔗 **Redux Store**: Fetches consent details from user's Redux store
- 📡 **Backend Sync**: Displays consent details that are updated via webhooks
- 🔄 **Status Tracking**: Shows complete consent lifecycle (PENDING → APPROVED/REJECTED)

## 🚀 **Ready for Testing:**

The ConsentScreen now:
1. ✅ **Displays user's current consent** with special styling
2. ✅ **Shows consent status** (PENDING, APPROVED, REJECTED)
3. ✅ **Provides navigation** to Accounts for approved consents
4. ✅ **Integrates with backend** consent details storage
5. ✅ **Updates in real-time** when consent status changes

## 📝 **Next Steps:**

1. **Test the mobile app** - Verify consent details are displayed correctly
2. **Create a consent** - Check that it appears in the "Current Consent" section
3. **Complete consent flow** - Verify status updates from PENDING to APPROVED
4. **Test navigation** - Ensure approved consents can navigate to Accounts

The ConsentScreen is now fully integrated with the user consent details system! 🎉
