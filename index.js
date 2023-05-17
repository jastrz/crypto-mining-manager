const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Replace the URL below with your own MongoDB URL
const url = 'mongodb://localhost:27017/db';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

const highScoreSchema = new mongoose.Schema({
  name: String,
  score: Number
});

const HighScore = mongoose.model('HighScore', highScoreSchema);

async function getHighScores() {
  try {
    const highScores = await HighScore.find().sort({ score: -1 }).limit(10);
    return highScores;
  } catch (error) {
    console.log('Error getting high scores:', error);
    throw error;
  }
}

app.get('/miningsim', async (req, res) => {
  try {
    const scores = await getHighScores();
    const username = req.query.username;
    res.render('miningsim', { scores, username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/highscores', async (req, res) => {
  const { name, score } = req.body;

  try {
    const newHighScore = new HighScore({ name, score });
    await newHighScore.save();
    res.json(newHighScore);
  } catch (error) {
    console.log('Error adding new high score:', error);
    res.status(500).send('Error adding new high score');
  }
});

app.get('/miningsimstart', (req, res) => {
  res.render('miningsimstart', { usernameExists: false });
});

app.post('/miningsimstart', async (req, res) => {
  const { username } = req.body;
  try {
    const existingScore = await HighScore.findOne({ name: username });
    if (existingScore) {
      res.render('miningsimstart', { usernameExists: true });
    } else {
      res.redirect(`/miningsim?username=${username}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/events', function(req, res) {
  res.sendFile('events.json', { root: __dirname, type: 'application/json' });
});

app.get('/data', function(req, res) {
  res.sendFile('data.json', { root: __dirname, type: 'application/json' });
});


app.listen(port, () => console.log(`Server listening on port ${port}`));
