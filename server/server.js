const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FILE = path.join(__dirname, 'count.json');

function readCount(){
  try{
    const raw = fs.readFileSync(FILE, 'utf8');
    const obj = JSON.parse(raw);
    return parseInt(obj.count || 0, 10) || 0;
  }catch(e){
    return 0;
  }
}

function writeCount(n){
  fs.writeFileSync(FILE, JSON.stringify({ count: n }, null, 2), 'utf8');
}

app.get('/api/count', (req, res) => {
  const count = readCount();
  res.json({ count });
});

app.post('/api/increment', (req, res) => {
  const delta = parseInt(req.body.delta || 1, 10) || 1;
  const current = readCount();
  const next = current + delta;
  writeCount(next);
  res.json({ count: next });
});

app.post('/api/reset', (req, res) => {
  const value = parseInt(req.body.count || 0, 10) || 0;
  writeCount(value);
  res.json({ count: value });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sayz counter API running on port ${PORT}`));
