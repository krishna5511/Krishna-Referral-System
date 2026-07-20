const crypto = require("crypto");

function generateVerificationToken() {
  // Random Secure Token
  const token = crypto.randomBytes(32).toString("hex");

  // Token Expiry (15 Minutes)
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  return {
    token,
    expires,
  };
}

module.exports = generateVerificationToken;