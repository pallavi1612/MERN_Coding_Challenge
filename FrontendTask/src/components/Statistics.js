import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Statistics.css';


const Statistics = ({ month }) => {
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  const fetchStatistics = () => {
    axios.get('/api/statistics', { params: { month } })
      .then(response => {
        setStatistics(response.data);
      })
      .catch(error => console.error('Error fetching statistics', error));
  };

  return (
    <div>
      <h3>Statistics</h3>
      <p>Total Sold Items: {statistics.soldItems}</p>
      <p>Total Not Sold Items: {statistics.notSoldItems}</p>
      <p>Total Sales Amount: ${statistics.totalSalesAmount}</p>
    </div>
  );
};

export default Statistics;
