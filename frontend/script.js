function addRow() {
  const tableBody = document.getElementById("tableBody");
  const newRow = tableBody.insertRow();

  // Add cells with input elements
  for (let i = 0; i < 9; i++) {
    const newCell = newRow.insertCell();
    const input = document.createElement("input");
    input.type = "text";
    if (i === 6) {
      input.readOnly = true; // Make Reduced Level cell readonly
    }
    newCell.appendChild(input);
  }
}

function calculate() {
  const tableBody = document.getElementById("tableBody");
  const rows = tableBody.rows;

  let reducedLevel = 0;

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    const backSight = parseFloat(cells[1].querySelector('input').value) || 0;
    const foreSight = parseFloat(cells[3].querySelector('input').value) || 0;

    let level;
    if (i === 0) {
      level = backSight;
    } else {
      const prevForeSight = parseFloat(rows[i - 1].cells[3].querySelector('input').value) || 0;
      level = backSight - prevForeSight + foreSight;
    }

    reducedLevel += level;
    cells[6].querySelector('input').value = level.toFixed(2);
  }

  alert(`Total Reduced Level: ${reducedLevel.toFixed(2)}`);
}

function saveToCSV() {
  const table = document.querySelector(".leveling-table");
  const rows = table.querySelectorAll("tr");

  const projectName = document.getElementById("projectName").value;
  const date = document.getElementById("date").value;

  let csvContent = `Project Name,${projectName}\nDate,${date}\n`;
  rows.forEach(row => {
    const cells = row.querySelectorAll("td, th");
    const rowContent = Array.from(cells)
      .map(cell => cell.querySelector("input") ? cell.querySelector("input").value : cell.innerText)
      .join(",");
    csvContent += rowContent + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "leveling_sheet.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
async function calculateLeveling() {
  const initialRL = parseFloat(document.getElementById('initialRL').value);
  const tableBody = document.getElementById('tableBody');
  const rows = tableBody.rows;
  const readings = [];

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    const point = cells[0].querySelector('input').value;
    const bs = parseFloat(cells[1].querySelector('input').value) || 0;
    const is = parseFloat(cells[2].querySelector('input').value) || 0;
    const fs = parseFloat(cells[3].querySelector('input').value) || 0;

    if (bs) readings.push({ point, type: 'B.S', value: bs });
    if (is) readings.push({ point, type: 'I.S', value: is });
    if (fs) readings.push({ point, type: 'F.S', value: fs });
  }

  const response = await fetch('http://localhost:3000/calculate-leveling', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ initialRL, readings })
  });

  const data = await response.json();
  updateResultsTable(data.results);
}

function updateResultsTable(results) {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';

  results.forEach(result => {
    const newRow = tableBody.insertRow();
    newRow.insertCell().appendChild(document.createTextNode(result.point));
    newRow.insertCell().appendChild(document.createTextNode(result.type === 'B.S' ? result.value : ''));
    newRow.insertCell().appendChild(document.createTextNode(result.type === 'I.S' ? result.value : ''));
    newRow.insertCell().appendChild(document.createTextNode(result.type === 'F.S' ? result.value : ''));
    newRow.insertCell().appendChild(document.createTextNode(result.rise));
    newRow.insertCell().appendChild(document.createTextNode(result.fall));
    newRow.insertCell().appendChild(document.createTextNode(result.rl));
    newRow.insertCell().appendChild(document.createTextNode(''));
    newRow.insertCell().appendChild(document.createTextNode(''));
  });
}
async function saveToCSV() {
  const tableBody = document.getElementById('tableBody');
  const rows = tableBody.rows;
  const projectName = document.getElementById('projectName').value;
  const date = document.getElementById('date').value;

  let tableData = '';
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    const rowContent = Array.from(cells)
      .map(cell => cell.querySelector('input') ? cell.querySelector('input').value : cell.innerText)
      .join(',');
    tableData += rowContent + '\n';
  }

  const response = await fetch('http://localhost:3000/save-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectName, date, tableData })
  });

  const data = await response.json();
  alert(data.message);
}
