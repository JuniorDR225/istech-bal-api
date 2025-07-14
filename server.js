const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// --- CONFIG POSTGRESQL RENDER ---
// Remplace par tes vraies valeurs Render (hébergeur, utilisateur, mot de passe, base)
const pool = new Pool({
  user: 'inscriptions_db_user',
  host: 'dpg-d1qbh42dbo4c73cb3tl0-a', // ton hostname Render PostgreSQL
  database: 'inscriptions_db',
  password: 'd3dvrlKTRzd5OIO82WrbRK0zVVlsTh1e',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // important si Render utilise SSL
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Création de la table inscriptions si elle n'existe pas
const createTableQuery = `
CREATE TABLE IF NOT EXISTS inscriptions (
  id SERIAL PRIMARY KEY,
  nomComplet VARCHAR(255) NOT NULL,
  classeFiliere VARCHAR(255),
  telephone VARCHAR(50),
  statut VARCHAR(50) NOT NULL,
  presence VARCHAR(20) NOT NULL,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool.query(createTableQuery)
  .then(() => console.log('✅ Table inscriptions prête'))
  .catch(err => console.error('❌ Erreur création table:', err));

// Route POST pour recevoir une inscription
app.post('/api/inscription', async (req, res) => {
  const { nomComplet, classeFiliere, telephone, statut, presence } = req.body;

  if (!nomComplet || !statut || !presence) {
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants.' });
  }

  try {
    const insertQuery = `
      INSERT INTO inscriptions (nomComplet, classeFiliere, telephone, statut, presence)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [nomComplet, classeFiliere || null, telephone || null, statut, presence]);

    res.status(201).json({ success: true, message: 'Inscription enregistrée ✅', data: result.rows[0] });
  } catch (error) {
    console.error('Erreur insertion:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l’enregistrement.' });
  }
});

// Route GET pour récupérer les inscriptions
app.get('/api/inscriptions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inscriptions ORDER BY date_inscription DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur récupération inscriptions:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la lecture des données.' });
  }
});

// Route DELETE pour vider toutes les inscriptions (utilisé par admin)
app.delete('/api/inscriptions', async (req, res) => {
  try {
    await pool.query('DELETE FROM inscriptions');
    res.json({ success: true, message: 'Toutes les inscriptions ont été supprimées.' });
  } catch (error) {
    console.error('Erreur suppression inscriptions:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression.' });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
