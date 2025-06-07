// config/db.js

const mongoose = require('mongoose');

// Optionnel: charger les variables d'environnement si vous les utilisez
// require('dotenv').config(); // Si vous utilisez dotenv pour gérer les variables d'environnement

const connectDB = async () => {
  try {
    // La chaîne de connexion à votre base de données MongoDB
    // Utilisez process.env.MONGO_URI pour ne pas exposer directement votre chaîne de connexion
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ma_base_de_donnees';

    // Options de connexion pour éviter les warnings et assurer une bonne connexion
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,       // Analyse les chaînes de connexion MongoDB
      useUnifiedTopology: true,    // Utilise le nouveau moteur de topologie et de découverte du serveur
      // useCreateIndex: true,     // Option deprecated dans Mongoose 6, gérée par défaut
      // useFindAndModify: false   // Option deprecated dans Mongoose 6, gérée par défaut
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    // Arrêter le processus en cas d'échec de connexion à la base de données
    process.exit(1);
  }
};

module.exports = connectDB;