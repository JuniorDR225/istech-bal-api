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

// Tableau temporaire en mémoire (cache)
let memoireInscriptions = [];

// Créer le fichier s’il n’existe pas
fs.ensureFileSync(DATA_FILE);

// Initialiser fichier JSON si vide
try {
  const contenu = fs.readFileSync(DATA_FILE, 'utf-8');
if (contenu.trim()) {
  memoireInscriptions = JSON.parse(contenu);
} else {
  memoireInscriptions = [];
}

} catch (err) {
  console.error("Erreur d'initialisation :", err);
  memoireInscriptions = [];
}

// POST: nouvelle inscription
app.post('/api/inscription', async (req, res) => {
  console.log("NOUVELLE INSCRIPTION REÇUE :", req.body);
  const newInscription = {
    ...req.body,
    date: new Date().toISOString()
  };

  try {
    // Sauvegarde en mémoire
    memoireInscriptions.push(newInscription);

    // Sauvegarde dans le fichier
        try {
      await fs.writeJson(DATA_FILE, memoireInscriptions, { spaces: 2 });
      console.log("✅ Inscription sauvegardée dans :", DATA_FILE);
    } catch (writeErr) {
      console.error("❌ Erreur lors de l’écriture dans le fichier :", writeErr);
    }

    res.status(201).json({ success: true, message: "Inscription enregistrée ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erreur lors de l’enregistrement.' });
  }
});

// GET: toutes les inscriptions
app.get('/api/inscriptions', (req, res) => {
  res.json(memoireInscriptions);
});

// DELETE: vider les inscriptions
app.delete('/api/inscriptions', async (req, res) => {
  try {
    memoireInscriptions = [];
    await fs.writeJson(DATA_FILE, [], { spaces: 2 });
    res.json({ success: true, message: "Toutes les inscriptions ont été supprimées." });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});
