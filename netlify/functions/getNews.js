// Netlify Serverless Function — GNews API proxy
// API key is stored securely as env variable in Netlify dashboard
// No CORS issues since this runs server-side

const TOPIC_MAP = {
  india: "nation",
  sports: "sports",
  politics: "politics",
  entertainment: "entertainment",
  general: "breaking-news",
};

exports.handler = async (event) => {
  try {
    const API_KEY = process.env.GNEWS_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "GNEWS_API_KEY environment variable not set in Netlify." }),
      };
    }

    const query = (event.queryStringParameters?.query || "india").toLowerCase();
    let url1, url2;

    if (TOPIC_MAP[query]) {
      // Category → top-headlines endpoint
      const base = `https://gnews.io/api/v4/top-headlines?topic=${TOPIC_MAP[query]}&lang=en&country=in&max=6&apikey=${API_KEY}`;
      url1 = base + "&page=1";
      url2 = base + "&page=2";
    } else {
      // Search query → search endpoint
      const base = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=6&sortby=publishedAt&apikey=${API_KEY}`;
      url1 = base + "&page=1";
      url2 = base + "&page=2";
    }

    // Fetch both pages in parallel (12 articles total)
    const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    const articles = [
      ...(data1.articles || []),
      ...(data2.articles || []),
    ];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ articles }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
