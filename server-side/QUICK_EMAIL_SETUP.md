# Quick Email Setup Guide

## 🚨 Can't Find App Passwords? Use Outlook Instead!

**EASIEST SOLUTION**: Use Outlook/Hotmail - No App Passwords needed!

### Step 1: Use Outlook Email (Recommended - Easiest)

1. **Create a free Outlook account** (if you don't have one):
   - Go to: https://outlook.live.com
   - Click "Create free account"
   - Sign up with any email

2. **Update your `.env` file**:
   ```
   EMAIL_SERVICE=hotmail
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-outlook-password
   ```

3. **That's it!** No App Passwords needed - just use your regular Outlook password.

---

## 🔍 If You Still Want to Use Gmail

### Method 1: Direct Link
Try this direct link:
**https://myaccount.google.com/apppasswords**

### Method 2: Step-by-Step Navigation

1. **Go to Google Account**: https://myaccount.google.com
2. **Click "Security"** (left sidebar)
3. **Scroll to "How you sign in to Google"**
4. **Click "2-Step Verification"**
   - If not enabled, enable it first (requires phone)
   - Wait 5-10 minutes after enabling
5. **Go back to Security page**
6. **Click "2-Step Verification" again**
7. **Scroll down** - you should see "App passwords" link
8. **Click "App passwords"**
9. **Select "Mail" and "Other"** → Enter name → Generate

### Method 3: Search in Google Account
1. Go to: https://myaccount.google.com
2. Use the search bar at the top
3. Type: **"App passwords"**
4. Click on the result

### Why App Passwords Might Not Show:
- ❌ 2-Step Verification not enabled
- ❌ Just enabled 2-Step Verification (wait 5-10 minutes)
- ❌ Using a work/school Google account (admin may have disabled it)
- ❌ Account is too new

---

## 📧 Alternative Email Services

### Option 1: Outlook/Hotmail (Easiest - Recommended)
```
EMAIL_SERVICE=hotmail
EMAIL_USER=yourname@outlook.com
EMAIL_PASS=your-regular-password
```

### Option 2: Yahoo Mail
Update `server-side/utils/mailer.js` to use:
```javascript
service: "yahoo",
```

### Option 3: Custom SMTP (Any Email Provider)
```
EMAIL_SERVICE=custom
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
```

---

## ✅ Quick Test

After setting up, restart your server and you should see:
```
✅ Email transporter configured successfully
```

Then test by requesting editor access - you should receive emails!

