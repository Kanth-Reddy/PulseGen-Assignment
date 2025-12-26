# Alternative Email Setup Methods

## Problem: Can't Find "App Passwords" in Google Account

If you can't find the "App Passwords" option, here are solutions:

## Solution 1: Direct Link to App Passwords

Try this direct link:
**https://myaccount.google.com/apppasswords**

If it says "You don't have 2-Step Verification turned on", you need to enable it first.

## Solution 2: Enable 2-Step Verification First

1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", find "2-Step Verification"
3. Click on it and **enable it** (you'll need your phone)
4. Wait 5-10 minutes after enabling
5. Then try the App Passwords link again: https://myaccount.google.com/apppasswords

## Solution 3: Use OAuth2 (More Secure, But Complex)

If App Passwords still don't work, we can set up OAuth2. This requires more setup but is more secure.

## Solution 4: Use a Different Email Service

### Option A: Use Outlook/Hotmail
Update `server-side/utils/mailer.js`:

```javascript
transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: emailUser,
    pass: emailPass  // Your regular Outlook password
  }
});
```

### Option B: Use SendGrid (Free Tier Available)
1. Sign up at https://sendgrid.com
2. Get API key
3. Update mailer.js to use SendGrid SMTP

### Option C: Use Mailtrap (For Testing)
1. Sign up at https://mailtrap.io
2. Get SMTP credentials
3. Use for testing (emails go to Mailtrap inbox, not real recipients)

## Solution 5: Use Your Own SMTP Server

If you have your own domain email, you can use its SMTP settings.

