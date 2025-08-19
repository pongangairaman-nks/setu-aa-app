# 🏛️ Setu Consent Flow Guide

## 📋 **Overview**

Based on the official Setu documentation, here's the complete consent flow to get mock bank accounts using Setu FIP-2.

## 🔄 **Complete Consent Flow Steps**

### **Step 1: Create Consent Request** ✅
```typescript
const consentData = {
  consentDuration: { unit: 'MONTH', value: '24' },
  vua: '7530060544@onemoney', // Your mobile number
  dataRange: {
    from: '2023-01-01T00:00:00Z',
    to: '2025-01-24T00:00:00Z'
  },
  consentTypes: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
  context: []
};
```

**Response:**
```json
{
  "id": "6d285134-c764-49ab-b32d-ead003161587",
  "url": "https://fiu.setu.co/v2/consents/webview/6d285134-c764-49ab-b32d-ead003161587",
  "status": "PENDING",
  "detail": {
    "vua": "7530060544@onemoney",
    "consentStart": "2023-04-10T05:36:43.011Z",
    "consentExpiry": "2023-08-08T05:36:43.011Z"
  }
}
```

### **Step 2: Consent Review by Customer** ⭐ **CRITICAL STEP**

#### **2.1: Redirect User to Consent URL**
```
https://fiu.setu.co/v2/consents/webview/[consent-id]
```

#### **2.2: User Goes Through These Steps:**
1. **Mobile Number Verification**
   - User enters mobile number
   - OTP verification (dynamic or static)

2. **Setu Fetches FIPs** 
   - Setu automatically fetches available Financial Information Providers
   - This is where Setu FIP-2 should appear

3. **User Links FIPs** ⭐ **KEY STEP**
   - User must select and link "Setu FIP-2" for mock data
   - This is where mock bank accounts get linked

4. **User Reviews Request**
   - User reviews the consent details
   - Approves or rejects the request

5. **Setu Validates and Saves Consent**
   - Consent status changes to ACTIVE
   - Mock accounts get linked

### **Step 3: Monitor Consent Status**
```bash
GET /consents/:id
```

**Response when ACTIVE:**
```json
{
  "id": "6d285134-c764-49ab-b32d-ead003161587",
  "status": "ACTIVE",
  "detail": {
    "vua": "7530060544@onemoney"
  },
  "accountsLinked": [
    {
      "accountId": "mock-account-1",
      "accountName": "Mock Savings Account",
      "bankName": "Setu Mock Bank",
      "accountType": "SAVINGS"
    }
  ]
}
```

### **Step 4: Fetch Data** ✅
Once consent is ACTIVE and accounts are linked, you can fetch data.

## 🎯 **Key Points from Setu Documentation**

### **Setu FIP vs Setu FIP-2**
- **Setu FIP**: Dynamic OTP sent to phone number
- **Setu FIP-2**: Static OTP `123456` ⭐ **Recommended for testing**

### **Mock Data**
> "Use Setu FIP or Setu FIP-2 to get access to mock financial data on staging. We have created these accounts to mock the FIP data schema based on the FIType chosen."

### **Mobile Number Whitelisting**
> "If you are using Onemoney as your AA partner in the UAT environment, please note that all new mobile numbers used for testing must be pre-whitelisted by the AA partner."

## 🚀 **Implementation Guide**

### **1. Create Consent Request**
```typescript
// Your current implementation is correct
const consentData: SandboxConsentRequest = {
  consentDuration: { unit: 'MONTH', value: '24' },
  vua: '7530060544@onemoney',
  dataRange: {
    from: '2023-01-01T00:00:00Z',
    to: '2025-01-24T00:00:00Z'
  },
  consentTypes: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
  context: []
};
```

### **2. Open Consent URL in WebView**
```typescript
openWebView({
  uri: consentRequest.url,
  onSuccess: (data) => {
    console.log('Consent approved:', data);
    // Check if accounts are linked
  },
  onError: (error) => {
    console.error('Consent failed:', error);
  },
});
```

### **3. Monitor Consent Status**
```typescript
const checkConsentStatus = async (consentId: string) => {
  const response = await setuApi.getConsentStatus(consentId);
  
  if (response.status === 'ACTIVE') {
    console.log('Consent is ACTIVE');
    console.log('Accounts linked:', response.accountsLinked);
    
    if (response.accountsLinked && response.accountsLinked.length > 0) {
      // Now you can fetch data
      await fetchAccounts(consentId);
    }
  }
};
```

## 🔍 **Troubleshooting**

### **Issue: No Bank Accounts Found**
**Root Cause**: Setu FIP-2 not linked during consent flow

**Solution**:
1. Complete the consent flow properly
2. Look for "Link FIPs" or "Connect Banks" section
3. Select "Setu FIP-2" for mock data
4. Complete the approval process

### **Issue: Consent Stays PENDING**
**Root Cause**: Consent flow not completed

**Solution**:
1. Visit the consent URL
2. Complete OTP verification
3. Link Setu FIP-2
4. Approve the consent

### **Issue: Mobile Number Not Whitelisted**
**Root Cause**: Mobile number not pre-whitelisted for Onemoney AA

**Solution**:
1. Contact support@setu.co
2. Request whitelisting for your mobile number
3. Wait 1-2 business days

## 📱 **Testing Steps**

### **Step 1: Create Consent**
```bash
node test-complete-consent-flow.js
```

### **Step 2: Complete Consent Flow**
1. Open the consent URL in browser/WebView
2. Enter mobile number: `7530060544`
3. Try OTP: `123456` (for Setu FIP-2)
4. **Look for and select "Setu FIP-2"**
5. Complete approval

### **Step 3: Verify Accounts**
```bash
# Check consent status
curl -X GET "https://hedgrpay.com/api/setu/consents/[consent-id]"

# If ACTIVE, fetch accounts
curl -X POST "https://hedgrpay.com/api/accounts/fetch" \
  -H "Content-Type: application/json" \
  -d '{"consentId": "[consent-id]", "dataRange": {"from": "2023-01-01T00:00:00Z", "to": "2025-01-24T00:00:00Z"}}'
```

## 🎯 **Success Criteria**

✅ Consent created with PENDING status  
✅ Consent URL generated  
✅ User completes OTP verification  
✅ User links Setu FIP-2  
✅ Consent becomes ACTIVE  
✅ Mock accounts appear in `accountsLinked`  
✅ Data fetching works  

## 📞 **Support**

For issues:
- **Technical**: Check the consent flow steps above
- **Whitelisting**: Email support@setu.co
- **Mock Data**: Ensure Setu FIP-2 is linked during consent flow
