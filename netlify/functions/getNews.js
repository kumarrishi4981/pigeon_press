const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters.query || "General";

    // ✅ Replace with your real GNews API key
    const API_KEY = process.env.GNEWS_API_KEY;

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=10&apikey=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch news from GNews" }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ articles: data.articles }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
