const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "dein_geheimes_jwt_schluessel"; // Später in .env speichern

// Alle Nutzer abrufen
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Abrufen der Nutzer" });
  }
});

// Nutzer nach ID abrufen
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User nicht gefunden" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Abrufen des Nutzers" });
  }
});

// Nutzer aktualisieren (ohne Passwortänderung)
router.put("/:id", async (req, res) => {
  try {
    // Passwortänderung hier nicht erlaubt
    const { password, ...updateData } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User nicht gefunden" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: "Fehler beim Aktualisieren" });
  }
});

// Nutzer löschen
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User nicht gefunden" });
    res.json({ message: "User gelöscht", user: deletedUser });
  } catch (error) {
    res.status(400).json({ error: "Fehler beim Löschen des Nutzers" });
  }
});

// Registrierung mit Passwort-Hashing
router.post("/register", async (req, res) => {
  try {
    const { name, hobbies, location, password } = req.body;
    if (!name || !password || !location || !hobbies) {
      return res.status(400).json({ error: "Alle Felder sind erforderlich" });
    }

    const existingUser = await User.findOne({ name });
    if (existingUser) return res.status(400).json({ error: "Nutzername existiert bereits" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, hobbies, location, password: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json({ message: "Registrierung erfolgreich", userId: savedUser._id });
  } catch (error) {
    res.status(500).json({ error: "Fehler bei Registrierung" });
  }
});

// Login mit Passwort-Prüfung und JWT-Token
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) return res.status(400).json({ error: "Name und Passwort erforderlich" });

    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ error: "Ungültiger Nutzer oder Passwort" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Ungültiger Nutzer oder Passwort" });

    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login erfolgreich", token });
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Login" });
  }
});

module.exports = router;
