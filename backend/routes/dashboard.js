const express = require('express');
const router = express.Router();
const { getStats, getRecent } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/recent', getRecent);

module.exports = router;
