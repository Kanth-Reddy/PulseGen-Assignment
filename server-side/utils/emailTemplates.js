// Neon-themed email templates matching the app's aesthetic

const getNeonEmailTemplate = (title, content, type = "info") => {
  const colors = {
    info: { primary: "#00b7ff", secondary: "#00f3ff", glow: "rgba(0, 183, 255, 0.8)" },
    success: { primary: "#00ff88", secondary: "#00d0ff", glow: "rgba(0, 255, 136, 0.8)" },
    warning: { primary: "#ffc107", secondary: "#ffd700", glow: "rgba(255, 193, 7, 0.8)" },
    error: { primary: "#ff3366", secondary: "#ff0066", glow: "rgba(255, 51, 102, 0.8)" }
  };

  const color = colors[type] || colors.info;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: #0a0a0a; font-family: 'Orbitron', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: rgba(10, 15, 30, 0.95); border-radius: 20px; border: 3px solid ${color.primary}; box-shadow: 0 0 30px ${color.glow}, inset 0 0 30px rgba(0, 183, 255, 0.3); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px; text-align: center; background: rgba(0, 183, 255, 0.1); border-bottom: 2px solid ${color.primary};">
              <h1 style="margin: 0; font-size: 2.5rem; color: ${color.secondary}; text-shadow: 0 0 10px ${color.primary}, 0 0 20px ${color.primary}, 0 0 30px ${color.primary}; letter-spacing: 5px; font-weight: 900;">
                MediaX
              </h1>
              <div style="margin-top: 20px; height: 2px; background: linear-gradient(90deg, transparent, ${color.primary}, transparent); box-shadow: 0 0 10px ${color.glow};"></div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 1.8rem; color: ${color.secondary}; text-shadow: 0 0 10px ${color.primary}; letter-spacing: 3px; font-weight: 700;">
                ${title}
              </h2>
              <div style="color: #fff; line-height: 1.8; font-size: 1rem;">
                ${content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background: rgba(0, 0, 0, 0.5); border-top: 1px solid rgba(0, 183, 255, 0.3);">
              <p style="margin: 0; color: #aaa; font-size: 0.9rem; letter-spacing: 2px;">
                © ${new Date().getFullYear()} MediaX. All rights reserved.
              </p>
              <p style="margin: 10px 0 0 0; color: ${color.primary}; font-size: 0.85rem; text-shadow: 0 0 5px ${color.glow};">
                Powered by Neon Technology
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Request submitted email (to user)
exports.requestSubmittedEmail = (username) => {
  const content = `
    <p style="margin-bottom: 20px;">Dear <strong style="color: ${"#00f3ff"}; text-shadow: 0 0 5px rgba(0, 183, 255, 0.5);">${username}</strong>,</p>
    <p style="margin-bottom: 20px;">Your request for <strong style="color: ${"#00b7ff"}; text-shadow: 0 0 5px rgba(0, 183, 255, 0.5);">Editor Access</strong> has been successfully submitted!</p>
    <p style="margin-bottom: 20px;">Our admin team will review your request and notify you of the decision soon.</p>
    <div style="margin: 30px 0; padding: 20px; background: rgba(0, 183, 255, 0.1); border: 1px solid rgba(0, 183, 255, 0.3); border-radius: 10px; text-align: center;">
      <p style="margin: 0; color: #00f3ff; font-size: 1.1rem; text-shadow: 0 0 10px rgba(0, 183, 255, 0.8);">⏳ Status: Pending Review</p>
    </div>
    <p style="margin-top: 20px; color: #aaa;">Thank you for your interest in becoming an editor!</p>
  `;
  return getNeonEmailTemplate("Editor Access Request Submitted", content, "info");
};

// Request notification email (to admin)
exports.requestNotificationEmail = (username, email) => {
  const content = `
    <p style="margin-bottom: 20px;">A new editor access request has been received:</p>
    <div style="margin: 20px 0; padding: 20px; background: rgba(0, 183, 255, 0.1); border: 1px solid rgba(0, 183, 255, 0.3); border-radius: 10px;">
      <p style="margin: 5px 0; color: #00f3ff;"><strong>Username:</strong> <span style="color: #fff; text-shadow: 0 0 5px rgba(0, 183, 255, 0.5);">${username}</span></p>
      <p style="margin: 5px 0; color: #00f3ff;"><strong>Email:</strong> <span style="color: #fff;">${email}</span></p>
    </div>
    <p style="margin-top: 20px;">Please review and respond to this request in the admin panel.</p>
  `;
  return getNeonEmailTemplate("New Editor Access Request", content, "info");
};

// Request approved email (to user)
exports.requestApprovedEmail = (username) => {
  const content = `
    <p style="margin-bottom: 20px;">Dear <strong style="color: ${"#00ff88"}; text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);">${username}</strong>,</p>
    <p style="margin-bottom: 20px;">Great news! Your request for <strong style="color: ${"#00ff88"}; text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);">Editor Access</strong> has been <strong style="color: ${"#00ff88"}; text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);">APPROVED</strong>! 🎉</p>
    <div style="margin: 30px 0; padding: 20px; background: rgba(0, 255, 136, 0.1); border: 2px solid rgba(0, 255, 136, 0.5); border-radius: 10px; text-align: center;">
      <p style="margin: 0; color: #00ff88; font-size: 1.3rem; font-weight: 700; text-shadow: 0 0 15px rgba(0, 255, 136, 0.8);">✅ APPROVED</p>
      <p style="margin: 10px 0 0 0; color: #fff;">You now have editor access to the platform!</p>
    </div>
    <p style="margin-top: 20px;">You can now log in and access all editor features. Welcome to the team!</p>
    <p style="margin-top: 20px; color: #aaa;">Thank you for being part of MediaX!</p>
  `;
  return getNeonEmailTemplate("Editor Access Approved", content, "success");
};

// Request rejected email (to user)
exports.requestRejectedEmail = (username) => {
  const content = `
    <p style="margin-bottom: 20px;">Dear <strong style="color: ${"#ff3366"}; text-shadow: 0 0 5px rgba(255, 51, 102, 0.5);">${username}</strong>,</p>
    <p style="margin-bottom: 20px;">We regret to inform you that your request for <strong style="color: ${"#ff3366"}; text-shadow: 0 0 5px rgba(255, 51, 102, 0.5);">Editor Access</strong> has been <strong style="color: ${"#ff3366"}; text-shadow: 0 0 10px rgba(255, 51, 102, 0.8);">REJECTED</strong>.</p>
    <div style="margin: 30px 0; padding: 20px; background: rgba(255, 51, 102, 0.1); border: 2px solid rgba(255, 51, 102, 0.5); border-radius: 10px; text-align: center;">
      <p style="margin: 0; color: #ff3366; font-size: 1.3rem; font-weight: 700; text-shadow: 0 0 15px rgba(255, 51, 102, 0.8);">❌ REJECTED</p>
      <p style="margin: 10px 0 0 0; color: #fff;">You can continue using the platform as a viewer.</p>
    </div>
    <p style="margin-top: 20px;">You may submit a new request after 10 minutes if you wish to try again.</p>
    <p style="margin-top: 20px; color: #aaa;">Thank you for your understanding.</p>
  `;
  return getNeonEmailTemplate("Editor Access Request Rejected", content, "error");
};

// Admin access removed email
exports.adminAccessRemovedEmail = (username) => {
  const content = `
    <p style="margin-bottom: 20px;">Dear <strong style="color: ${"#ff3366"}; text-shadow: 0 0 5px rgba(255, 51, 102, 0.5);">${username}</strong>,</p>
    <p style="margin-bottom: 20px;">Your <strong style="color: ${"#ff3366"}; text-shadow: 0 0 5px rgba(255, 51, 102, 0.5);">Admin Access</strong> has been removed from your account.</p>
    <div style="margin: 30px 0; padding: 20px; background: rgba(255, 51, 102, 0.1); border: 2px solid rgba(255, 51, 102, 0.5); border-radius: 10px; text-align: center;">
      <p style="margin: 0; color: #ff3366; font-size: 1.3rem; font-weight: 700; text-shadow: 0 0 15px rgba(255, 51, 102, 0.8);">⚠️ ADMIN ACCESS REMOVED</p>
      <p style="margin: 10px 0 0 0; color: #fff;">Your role has been changed. Please contact support if you have questions.</p>
    </div>
    <p style="margin-top: 20px; color: #aaa;">This action was performed by an administrator.</p>
  `;
  return getNeonEmailTemplate("Admin Access Removed", content, "warning");
};

// Editor access removed email
exports.editorAccessRemovedEmail = (username) => {
  const content = `
    <p style="margin-bottom: 20px;">Dear <strong style="color: ${"#ff3366"}; text-shadow: 0 0 5px rgba(255, 51, 102, 0.5);">${username}</strong>,</p>
    <p style="margin-bottom: 20px;">Your <strong style="color: ${"#ff3366"}; text-shadow: 0 0 5px rgba(255, 51, 102, 0.5);">Editor Access</strong> has been removed from your account.</p>
    <div style="margin: 30px 0; padding: 20px; background: rgba(255, 51, 102, 0.1); border: 2px solid rgba(255, 51, 102, 0.5); border-radius: 10px; text-align: center;">
      <p style="margin: 0; color: #ff3366; font-size: 1.3rem; font-weight: 700; text-shadow: 0 0 15px rgba(255, 51, 102, 0.8);">⚠️ EDITOR ACCESS REMOVED</p>
      <p style="margin: 10px 0 0 0; color: #fff;">Your role has been changed to <strong style="color: #00b7ff; text-shadow: 0 0 5px rgba(0, 183, 255, 0.5);">Viewer</strong>.</p>
    </div>
    <p style="margin-top: 20px;">You can continue using the platform as a viewer. If you wish to regain editor access, you can submit a new request.</p>
    <p style="margin-top: 20px; color: #aaa;">This action was performed by an administrator.</p>
  `;
  return getNeonEmailTemplate("Editor Access Removed - MediaX", content, "warning");
};

