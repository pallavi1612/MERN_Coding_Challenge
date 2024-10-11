const express = require('express');
const axios = require('axios');
const Transaction = require('../models/Transaction');
const router = express.Router();

router.get('/init-db', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.deleteMany(); 
    await Transaction.insertMany(transactions); 

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/transactions', async (req, res) => {
  const { search = '', page = 1, perPage = 10, month } = req.query;
  const searchQuery = new RegExp(search, 'i');
  
  const dateFilter = month ? { dateOfSale: { $regex: month, $options: 'i' } } : {};

  try {
    const transactions = await Transaction.find({
      ...dateFilter,
      $or: [
        { title: searchQuery },
        { description: searchQuery },
        { price: searchQuery }
      ]
    })
    .skip((page - 1) * perPage)
    .limit(Number(perPage));

    const total = await Transaction.countDocuments({
      ...dateFilter,
      $or: [
        { title: searchQuery },
        { description: searchQuery },
        { price: searchQuery }
      ]
    });

    res.status(200).json({ transactions, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/statistics', async (req, res) => {
  const { month } = req.query;

  try {
    const soldItems = await Transaction.countDocuments({ sold: true, dateOfSale: { $regex: month, $options: 'i' } });
    const notSoldItems = await Transaction.countDocuments({ sold: false, dateOfSale: { $regex: month, $options: 'i' } });
    const totalSalesAmount = await Transaction.aggregate([
      { $match: { sold: true, dateOfSale: { $regex: month, $options: 'i' } } },
      { $group: { _id: null, totalAmount: { $sum: '$price' } } }
    ]);

    res.status(200).json({
      soldItems,
      notSoldItems,
      totalSalesAmount: totalSalesAmount.length > 0 ? totalSalesAmount[0].totalAmount : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/bar-chart', async (req, res) => {
  const { month } = req.query;

  try {
    const priceRanges = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401-500', count: 0 },
      { range: '501-600', count: 0 },
      { range: '601-700', count: 0 },
      { range: '701-800', count: 0 },
      { range: '801-900', count: 0 },
      { range: '901-above', count: 0 }
    ];

    const transactions = await Transaction.find({ dateOfSale: { $regex: month, $options: 'i' } });

    transactions.forEach(transaction => {
      const price = transaction.price;
      if (price <= 100) priceRanges[0].count++;
      else if (price <= 200) priceRanges[1].count++;
      else if (price <= 300) priceRanges[2].count++;
      
    });

    res.status(200).json(priceRanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/pie-chart', async (req, res) => {
  const { month } = req.query;

  try {
    const categories = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: month, $options: 'i' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/combined', async (req, res) => {
  const { month } = req.query;

  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      Transaction.find({ dateOfSale: { $regex: month, $options: 'i' } }),
      Transaction.find({ dateOfSale: { $regex: month, $options: 'i' } }),
      Transaction.find({ dateOfSale: { $regex: month, $options: 'i' } }),
      Transaction.find({ dateOfSale: { $regex: month, $options: 'i' } }),
    ]);

    res.status(200).json({
      transactions,
      statistics,
      barChart,
      pieChart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
