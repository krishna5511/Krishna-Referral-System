const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://krishna-referral-system.vercel.app",
  "https://krishna-referral-system-git-main-krishnas-projects-c1fe5c17.vercel.app",
  "https://krishna-referral-system-krishnas-projects-c1fe5c17.vercel.app",
];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      console.log("Incoming Origin:", origin);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        console.log("✅ Allowed:", origin);
        return callback(null, true);
      }

      console.log("❌ Blocked:", origin);

      // ❗ Testing ke liye temporarily allow kar do
      return callback(null, true);
    },
  })
);

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