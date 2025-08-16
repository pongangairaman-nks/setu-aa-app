# Setu Account Aggregator Callback Configuration Guide

## Problem
Setu's dashboard doesn't accept mobile app deep links (like `setu-aa-app://consent-callback`) as redirect URLs. This is a common limitation with account aggregator integrations.

## Solution
Use your backend as a redirect intermediary. Here's how it works:

1. **Setu Dashboard Configuration**: Set the redirect URL to your backend endpoint
2. **Backend Callback**: Handle the redirect and forward to your mobile app
3. **Mobile App**: Receive the deep link and process the consent result

## Step-by-Step Configuration

### 1. Backend Setup (Already Implemented)

Your backend now has a callback endpoint at:
```
http://13.233.96.134:5000/api/consents/callback
```

This endpoint:
- Receives the redirect from Setu with consent parameters
- Updates the consent status in your database
- Redirects to your mobile app deep link

### 2. Setu Dashboard Configuration

In your Setu dashboard, configure the **Redirect URL** as:
```
http://13.233.96.134:5000/api/consents/callback
```

**NOT** the mobile app deep link.

### 3. Mobile App Deep Linking

Your mobile app is configured to handle deep links with the scheme `setu-aa-app://`. The callback will redirect to:
```
setu-aa-app://consent-callback?consentId=xxx&status=xxx&error=xxx
```

## Flow Diagram

```
User → Mobile App → Backend → Setu → User Browser → Setu Consent → 
Backend Callback → Mobile App Deep Link → ConsentCallbackScreen
```

## Testing the Setup

### 1. Test Backend Callback
Run the test script:
```bash
node test-callback.js
```

This will test if your backend callback endpoint is working correctly.

### 2. Test Mobile App Deep Link
You can test the deep link manually by:
- Opening your mobile app
- Using a URL like: `setu-aa-app://consent-callback?consentId=test-123&status=ACTIVE`

### 3. Full Flow Test
1. Create a consent request from your mobile app
2. Open the consent URL in a browser
3. Complete the consent flow
4. Verify you're redirected back to your mobile app

## Important Notes

### Backend Callback Endpoint
The callback endpoint (`/api/consents/callback`) handles:
- `consentId`: The consent identifier
- `status`: Consent status (ACTIVE, REJECTED, etc.)
- `error`: Any error information
- `error_code`: Error code if applicable
- `error_message`: Detailed error message

### Mobile App Navigation
The mobile app will:
1. Receive the deep link
2. Update the consent status in Redux store
3. Navigate to `ConsentCallbackScreen`
4. Show appropriate success/error message
5. Navigate to the next appropriate screen

### Error Handling
- If the backend callback fails, it will still try to redirect to the mobile app with error information
- The mobile app handles both success and error scenarios
- Users can manually navigate if automatic navigation fails

## Troubleshooting

### Common Issues

1. **Backend not accessible**: Ensure your EC2 instance is running and the port 5000 is open
2. **Deep link not working**: Check that your app scheme is correctly configured in `app.json`
3. **Navigation not working**: Verify that `ConsentCallbackScreen` is added to the navigation stack

### Debug Steps

1. Check backend logs for callback requests
2. Verify Setu dashboard redirect URL configuration
3. Test deep link manually in your mobile app
4. Check mobile app console logs for deep link handling

## Security Considerations

- The callback endpoint is public but only handles redirects
- Sensitive data is not exposed in the callback URL
- All actual API calls go through authenticated endpoints
- Webhook notifications provide additional security for status updates

## Next Steps

1. Configure the redirect URL in Setu dashboard
2. Test the complete flow
3. Monitor logs for any issues
4. Implement additional error handling if needed

This solution provides a robust way to handle Setu's redirect requirements while maintaining a good user experience in your mobile app.
