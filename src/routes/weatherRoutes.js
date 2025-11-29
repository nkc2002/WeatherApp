const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Home page
router.get('/', weatherController.showHomePage);

// Weather result page
router.get('/weather', weatherController.getWeather);

// Forecast page
router.get('/forecast', weatherController.getForecast);

module.exports = router;
