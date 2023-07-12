const express = require('express');
const { sequelize, User, Msg, Channel } = require('./model/models');

// Créez une instance d'application Express
const app = express();

// Synchronisez les modèles avec la base de données
sequelize.authenticate().catch((err)=>console.log({err}) )
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


// Démarrez le serveur
app.listen(3000, () => {
  console.log('Le serveur est en écoute sur le port 3000');
});
