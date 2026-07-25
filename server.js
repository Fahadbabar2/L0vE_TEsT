require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from your Loveable frontend (and anywhere, by default, for easy dev)
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "💘 Love Test API is running", version: "1.0.0" });
});

app.use("/api", sessionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`💘 Love Test backend running at http://localhost:${PORT}`);
});
