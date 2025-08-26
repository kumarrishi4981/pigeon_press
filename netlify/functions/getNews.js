// netlify/functions/getNews.js
import fetch from "node-fetch";

export async function handler(event, context) {
  const API_KEY = "73214130c4b94a44b3229917cad156fa";
  const query = event.queryStringParameters.query || "India";

  const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
