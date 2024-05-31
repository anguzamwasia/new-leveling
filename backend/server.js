const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to calculate leveling data
app.post('/calculate-leveling', (req, res) => {
  const { initialRL, readings } = req.body;

  let currentRL = initialRL;
  const results = readings.map(reading => {
    let rise = 0, fall = 0;

    if (reading.type === 'B.S') {
      rise = reading.value;
    } else if (reading.type === 'F.S') {
      fall = reading.value;
    } else if (reading.type === 'I.S') {
      // Intermediate sight does not affect RL directly
    }

    if (reading.type === 'B.S') {
      currentRL += rise;
    } else if (reading.type === 'F.S') {
      currentRL -= fall;
    }

    return {
      point: reading.point,
      type: reading.type,
      value: reading.value,
      rise: rise || '',
      fall: fall || '',
      rl: currentRL.toFixed(2)
    };
  });

  res.json({ results });
});

// Endpoint to save project details and table data
app.post('/save-project', (req, res) => {
  const { projectName, date, tableData } = req.body;

  const csvContent = `Project Name,${projectName}\nDate,${date}\n${tableData}`;
  const filePath = `./projects/${projectName.replace(/\s/g, '_')}_${date.replace(/-/g, '')}.csv`;

  fs.writeFile(filePath, csvContent, (err) => {
    if (err) {
      console.error('Error saving project:', err);
      res.status(500).json({ message: 'Error saving project' });
    } else {
      res.json({ message: 'Project saved successfully', filePath });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
