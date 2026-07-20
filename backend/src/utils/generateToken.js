const jwt = require("jsonwebtoken");

const generateToken = (user, res) => {
  const token = jwt.sign(
    {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
    process.env.JWT_SECRETKEY,
    {
      expiresIn: "7d",
    }
  );

res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

  return token;
};

module.exports = {
  generateToken,
};