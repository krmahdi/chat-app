const express = require('express');
const { sequelize} = require('./database/db');

// Créez une instance d'application Express
const app = express();

// Synchronisez les modèles avec la base de données
/*sequelize.sync()
  .then(() => {
    console.log('Base de données synchronisée');
  })
  .catch(err => {
    console.error('Erreur lors de la synchronisation de la base de données :', err);
  });*/


// Démarrez le serveur
app.listen(3001, () => {
  console.log('Le serveur est en écoute sur le port 3001');
});
