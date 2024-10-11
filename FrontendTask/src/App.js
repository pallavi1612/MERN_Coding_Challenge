import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChartComponent from './components/BarChart';

function App() {
  const [month, setMonth] = useState('January');

  return (
    <div>
      <h1>Transactions Dashboard</h1>

      <label>Select Month: </label>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="March">April</option>
        <option value="March">May</option>
        <option value="March">June</option>
        <option value="March">July</option>
        <option value="March">August</option>
        <option value="March">September</option>
        <option value="March">Octomber</option>
        <option value="March">November</option>
        <option value="March">December</option>
      </select>

      <TransactionsTable month={month} />
      <Statistics month={month} />
      <BarChartComponent month={month} />
    </div>
  );
}

export default App;

