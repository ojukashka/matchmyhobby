const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Pfad zu deinem User-Modell anpassen
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "dein_geheimer_jwt_schluessel"; // Später besser per Umgebungsvariable speichern

// Registrierung
router.post("/register", async (req, res) => {
  try {
    const { name, hobbies, location, password } = req.body;

    // Prüfen, ob der Name schon vergeben ist
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ error: "Nutzername bereits vergeben" });
    }

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nutzer anlegen
    const user = new User({ name, hobbies, location, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Registrierung erfolgreich" });
  } catch (error) {
    res.status(500).json({ error: "Fehler bei der Registrierung" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    // Nutzer suchen
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({ error: "Nutzer nicht gefunden" });
    }

    // Passwort prüfen
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Ungültiges Passwort" });
    }

    // Token generieren
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Login" });
  }
});

module.exports = router;
