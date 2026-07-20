require("dotenv").config()

const app = require("./src/app");
const dns = require("dns");

// Force Cloudflare and Google DNS for SRV lookups
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const connectDb = require("./src/config/db");
connectDb();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});