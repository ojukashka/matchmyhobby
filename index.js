const express = require("express");
const cors = require("cors");
const path = require("path");
const connectToDatabase = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

// **Verbindung zur Datenbank aufbauen**
connectToDatabase();

// API-Routen VOR dem static Middleware registrieren!
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "API funktioniert" });
});

// Statische Dateien aus "pages" ausliefern (Frontend)
app.use(express.static(path.join(__dirname, "pages")));

// Alle nicht API-Anfragen auf index.html weiterleiten (für SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
