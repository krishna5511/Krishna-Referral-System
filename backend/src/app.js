const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);


// ==========================
// helmet
// ==========================


const helmet = require("helmet");
app.use(helmet());


// ==========================
// Rate Limiter
// ==========================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  limit: 10000, // 100 Requests/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

app.use(limiter);
// ==========================
// Routes
// ==========================

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const referralRoutes = require("./routes/referral.routes");
const withdrawalRoutes = require("./routes/withdrawal.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const supportRoutes = require("./routes/support.routes");

// ==========================
// API Routes
// ==========================

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/referral", referralRoutes);

app.use("/api/withdrawal", withdrawalRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/notification", notificationRoutes);

app.use("/api/support", supportRoutes);





module.exports = app;