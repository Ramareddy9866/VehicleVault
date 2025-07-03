let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  throw new Error('REACT_APP_API_URL is not defined in your environment variables. Please set it in your .env file.');
}

if (!API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/?$/, '/api');
}

export default API_URL; 