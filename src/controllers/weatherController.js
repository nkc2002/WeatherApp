const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

exports.showHomePage = (req, res) => {
  res.render('index', {
    title: 'Weather App - Trang chủ',
    error: null
  });
};

exports.getWeather = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.render('index', {
        title: 'Weather App - Trang chủ',
        error: 'Vui lòng nhập tên thành phố'
      });
    }

    if (!API_KEY || API_KEY === 'your_api_key_here') {
      return res.render('index', {
        title: 'Weather App - Trang chủ',
        error: 'API key chưa được cấu hình. Vui lòng thêm OPENWEATHER_API_KEY vào file .env'
      });
    }

    // Call OpenWeather API
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'vi'
      }
    });

    const weather = response.data;

    res.render('weather', {
      title: `Thời tiết ${weather.name} - Weather App`,
      weather
    });

  } catch (error) {
    console.error('Error fetching weather:', error.message);

    let errorMessage = 'Đã xảy ra lỗi khi lấy dữ liệu thời tiết';

    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = 'Không tìm thấy thành phố. Vui lòng kiểm tra lại tên thành phố';
          break;
        case 401:
          errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại cấu hình';
          break;
        case 429:
          errorMessage = 'Đã vượt quá giới hạn số lần gọi API. Vui lòng thử lại sau';
          break;
        default:
          errorMessage = `Lỗi từ API: ${error.response.data.message || 'Không xác định'}`;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet';
    }

    res.render('index', {
      title: 'Weather App - Trang chủ',
      error: errorMessage
    });
  }
};

exports.getForecast = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.render('index', {
        title: 'Weather App - Trang chủ',
        error: 'Vui lòng nhập tên thành phố'
      });
    }

    if (!API_KEY || API_KEY === 'your_api_key_here') {
      return res.render('index', {
        title: 'Weather App - Trang chủ',
        error: 'API key chưa được cấu hình. Vui lòng thêm OPENWEATHER_API_KEY vào file .env'
      });
    }

    // Call OpenWeather Forecast API (5 days / 3 hours)
    const response = await axios.get(FORECAST_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'vi'
      }
    });

    const forecastData = response.data;

    // Group forecast by day (get one forecast per day at 12:00)
    const dailyForecasts = [];
    const processedDates = new Set();

    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateString = date.toLocaleDateString('vi-VN');

      // Get midday forecast (12:00) or first forecast of the day
      const hour = date.getHours();

      if (!processedDates.has(dateString)) {
        if (hour >= 12 && hour <= 15) {
          dailyForecasts.push({
            date: date,
            dateString: dateString,
            dayName: date.toLocaleDateString('vi-VN', { weekday: 'long' }),
            temp: item.main.temp,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            wind_speed: item.wind.speed,
            clouds: item.clouds.all,
            pressure: item.main.pressure
          });
          processedDates.add(dateString);
        }
      }
    });

    // If we don't have enough midday forecasts, fill with first available of each day
    if (dailyForecasts.length < 5) {
      processedDates.clear();
      dailyForecasts.length = 0;

      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString('vi-VN');

        if (!processedDates.has(dateString) && dailyForecasts.length < 5) {
          dailyForecasts.push({
            date: date,
            dateString: dateString,
            dayName: date.toLocaleDateString('vi-VN', { weekday: 'long' }),
            temp: item.main.temp,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            wind_speed: item.wind.speed,
            clouds: item.clouds.all,
            pressure: item.main.pressure
          });
          processedDates.add(dateString);
        }
      });
    }

    res.render('forecast', {
      title: `Dự báo thời tiết ${forecastData.city.name} - Weather App`,
      city: forecastData.city,
      forecasts: dailyForecasts.slice(0, 5)
    });

  } catch (error) {
    console.error('Error fetching forecast:', error.message);

    let errorMessage = 'Đã xảy ra lỗi khi lấy dữ liệu dự báo';

    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = 'Không tìm thấy thành phố. Vui lòng kiểm tra lại tên thành phố';
          break;
        case 401:
          errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại cấu hình';
          break;
        case 429:
          errorMessage = 'Đã vượt quá giới hạn số lần gọi API. Vui lòng thử lại sau';
          break;
        default:
          errorMessage = `Lỗi từ API: ${error.response.data.message || 'Không xác định'}`;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet';
    }

    res.render('index', {
      title: 'Weather App - Trang chủ',
      error: errorMessage
    });
  }
};
