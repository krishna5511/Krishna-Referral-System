function verifyEmailTemplate(name, verificationLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Verify Your Email</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
              <td align="center">

                  <table width="600" cellpadding="0" cellspacing="0"
                      style="background:#ffffff;margin:40px auto;border-radius:10px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,.1);">

                      <tr>
                          <td align="center"
                              style="background:#2563eb;padding:30px;color:white;font-size:28px;font-weight:bold;">
                              Referral & Ambassador System
                          </td>
                      </tr>

                      <tr>
                          <td style="padding:40px;">

                              <h2>Hello ${name}, 👋</h2>

                              <p style="font-size:16px;line-height:28px;color:#444;">
                                  Thank you for creating your account.
                              </p>

                              <p style="font-size:16px;line-height:28px;color:#444;">
                                  Please verify your email address by clicking the button below.
                              </p>

                              <div style="text-align:center;margin:35px 0;">
                                  <a href="${verificationLink}"
                                      style="
                                      background:#2563eb;
                                      color:#fff;
                                      text-decoration:none;
                                      padding:14px 28px;
                                      border-radius:8px;
                                      font-size:16px;
                                      display:inline-block;
                                      ">
                                      Verify Email
                                  </a>
                              </div>

                              <p style="font-size:15px;color:#666;">
                                  This verification link will expire in
                                  <strong>15 minutes</strong>.
                              </p>

                              <p style="font-size:15px;color:#666;">
                                  If you didn't create this account,
                                  you can safely ignore this email.
                              </p>

                              <hr>

                              <p style="font-size:13px;color:#999;">
                                  If the button doesn't work, copy and paste the following link into your browser:
                              </p>

                              <p style="word-break:break-all;color:#2563eb;">
                                  ${verificationLink}
                              </p>

                          </td>
                      </tr>

                      <tr>
                          <td
                              style="background:#f8f8f8;padding:20px;text-align:center;color:#888;font-size:13px;">

                              © ${new Date().getFullYear()} Referral & Ambassador System

                          </td>
                      </tr>

                  </table>

              </td>
          </tr>
      </table>

  </body>
  </html>
  `;
}

function forgotPasswordTemplate(name, resetLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Reset Password</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
              <td align="center">

                  <table width="600" cellpadding="0" cellspacing="0"
                      style="background:#ffffff;margin:40px auto;border-radius:10px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,.1);">

                      <tr>
                          <td align="center"
                              style="background:#dc2626;padding:30px;color:white;font-size:28px;font-weight:bold;">
                              Password Reset
                          </td>
                      </tr>

                      <tr>
                          <td style="padding:40px;">

                              <h2>Hello ${name}, 👋</h2>

                              <p style="font-size:16px;line-height:28px;color:#444;">
                                  We received a request to reset your password.
                              </p>

                              <div style="text-align:center;margin:35px 0;">
                                  <a href="${resetLink}"
                                      style="
                                      background:#dc2626;
                                      color:white;
                                      text-decoration:none;
                                      padding:14px 28px;
                                      border-radius:8px;
                                      display:inline-block;
                                      ">
                                      Reset Password
                                  </a>
                              </div>

                              <p style="font-size:15px;color:#666;">
                                  This link will expire in
                                  <strong>15 minutes</strong>.
                              </p>

                              <p style="font-size:15px;color:#666;">
                                  If you didn't request a password reset,
                                  please ignore this email.
                              </p>

                              <hr>

                              <p style="font-size:13px;color:#999;">
                                  Or copy this link:
                              </p>

                              <p style="word-break:break-all;color:#dc2626;">
                                  ${resetLink}
                              </p>

                          </td>
                      </tr>

                      <tr>
                          <td
                              style="background:#f8f8f8;padding:20px;text-align:center;color:#888;font-size:13px;">

                              © ${new Date().getFullYear()} Referral & Ambassador System

                          </td>
                      </tr>

                  </table>

              </td>
          </tr>
      </table>

  </body>
  </html>
  `;
}

module.exports = {
  verifyEmailTemplate,
  forgotPasswordTemplate,
};