# Email Setup Guide for Nodemailer

## Step-by-Step Instructions to Configure Gmail

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on **2-Step Verification**
3. Follow the prompts to enable it (you'll need your phone)

### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to [Security Settings](https://myaccount.google.com/security)
2. Scroll down to "2-Step Verification" section
3. Click on **App passwords** (you may need to sign in again)
4. If you don't see "App passwords":
   - Make sure 2-Step Verification is enabled
   - It may take a few minutes to appear after enabling

### Step 3: Create App Password
1. In "App passwords" page:
   - Select app: Choose **Mail**
   - Select device: Choose **Other (Custom name)**
   - Enter name: `MediaX Server` or any name you prefer
   - Click **Generate**

2. **IMPORTANT**: Copy the 16-character password immediately (you won't see it again!)
   - It will look like: `abcd efgh ijkl mnop` (with spaces)
   - Remove the spaces when using it: `abcdefghijklmnop`

### Step 4: Update .env File
1. Open `server-side/.env` file
2. Replace `your-email@gmail.com` with your actual Gmail address
3. Replace `your-16-character-app-password` with the App Password you just generated
4. Save the file

### Step 5: Restart Server
1. Stop your server (Ctrl+C)
2. Start it again: `npm start`
3. You should see: `✅ Email transporter configured` (no warning messages)

## Example .env File:
```
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

## Troubleshooting

### "Less secure app access" error
- Gmail no longer supports "less secure apps"
- You MUST use App Passwords (not your regular Gmail password)

### "Invalid login" error
- Make sure you're using the App Password (16 characters), not your regular password
- Remove any spaces from the App Password
- Make sure 2-Step Verification is enabled

### "Email transporter not configured" warning
- Check that `.env` file exists in `server-side/` folder
- Make sure EMAIL_USER and EMAIL_PASS are set correctly
- Restart the server after updating .env

## Alternative: Using Other Email Providers

If you want to use a different email provider (not Gmail), update the transporter in `server-side/utils/mailer.js`:

```javascript
// For Outlook/Hotmail
transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// For Custom SMTP
transporter = nodemailer.createTransport({
  host: "smtp.yourdomain.com",
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass
  }
});
```

