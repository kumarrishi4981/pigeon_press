exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters.query || "General";

    const API_KEY = process.env.GNEWS_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GNEWS_API_KEY in environment" }),
      };
    }

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=en&country=in&max=10&apikey=${API_KEY}`;

    const response = await fetch(url); // ✅ built-in fetch
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ articles: data.articles || [] }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
