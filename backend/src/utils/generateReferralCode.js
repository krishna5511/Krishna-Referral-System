const crypto = require("crypto");

/**
 * Generate Referral Code
 * Example:
 * userName = krishna
 * Output = KRIS7F3D
 */

function generateReferralCode(userName) {
  if (!userName) {
    throw new Error("Username is required to generate referral code.");
  }

  // Remove spaces and special characters
  const cleanedUserName = userName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  // First 4 characters
  const namePart = cleanedUserName.slice(0, 4);

  // Random 4 hex characters
  const randomPart = crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();

  return `${namePart}${randomPart}`;
}

module.exports = generateReferralCode;