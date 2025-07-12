const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'inscriptions.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialise le fichier JSON si vide
fs.ensureFileSync(DATA_FILE);
if (!fs.existsSync(DATA_FILE) || fs.readFileSync(DATA_FILE, 'utf-8').trim() === '') {
  fs.writeJsonSync(DATA_FILE, []);
}

// Route POST pour recevoir une inscription
app.post('/api/inscription', async (req, res) => {
  const newInscription = {
    ...req.body,
    date: new Date().toISOString()
  };

  try {
    const data = await fs.readJson(DATA_FILE);
    data.push(newInscription);
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    res.status(201).json({ success: true, message: "Inscription enregistrée ✅" });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l’enregistrement.' });
  }
});

// Route GET pour récupérer les inscriptions
app.get('/api/inscriptions', async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la lecture des données.' });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
