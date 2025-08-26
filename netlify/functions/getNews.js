const fetch = require("node-fetch");

exports.handler = async (event) => {
  const API_KEY = "YOUR_NEWSAPI_KEY";
  const category = event.queryStringParameters.category || "general";

  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
