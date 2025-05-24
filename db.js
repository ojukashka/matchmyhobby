const mongoose = require("mongoose");

const uri = "mongodb+srv://Test123:Test123@matchmyhobby.k8odxnw.mongodb.net/matchmyhobby?retryWrites=true&w=majority&appName=matchmyhobby";

async function connectToDatabase() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

module.exports = connectToDatabase;
