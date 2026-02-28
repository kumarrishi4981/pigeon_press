// =====================================================
//  PigeonPress — Powered by GNews.io API (Free)
//  Sign up at https://gnews.io to get your free API key
//  Paste your key below 👇
// =====================================================
const API_KEY = "3fd70ca553d31d5b7675095d1f8f37ea";
const BASE = "https://gnews.io/api/v4";

// Map navbar categories to GNews topics
const TOPIC_MAP = {
    india: "nation",
    sports: "sports",
    politics: "politics",
    entertainment: "entertainment",
    general: "breaking-news",
};

// In-memory cache to avoid re-fetching same query
const cache = {};

// ── Main fetch function ────────────────────────────────────────────────────────
const fetchNews = async (query) => {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = `
        <div class="loading-wrap">
            <div class="spinner"></div>
            <p>Loading articles...</p>
        </div>`;

    // Serve from cache if available (avoids wasting free quota)
    if (cache[query]) {
        bindData(cache[query], query);
        return;
    }

    try {
        const key = query.toLowerCase();
        let url1, url2;

        if (TOPIC_MAP[key]) {
            const base = `${BASE}/top-headlines?topic=${TOPIC_MAP[key]}&lang=en&country=in&max=6&apikey=${API_KEY}`;
            url1 = base + `&page=1`;
            url2 = base + `&page=2`;
        } else {
            const base = `${BASE}/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=6&sortby=publishedAt&apikey=${API_KEY}`;
            url1 = base + `&page=1`;
            url2 = base + `&page=2`;
        }

        // Fetch both pages in parallel
        const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);

        if (res1.status === 403 || res2.status === 403) {
            throw new Error("Invalid API key. Please check your GNews API key in app.js");
        }
        if (res1.status === 429 || res2.status === 429) {
            throw new Error("Daily request limit reached. GNews free plan allows 100 requests/day.");
        }
        if (!res1.ok) throw new Error(`HTTP Error: ${res1.status}`);

        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

        // Merge both pages (12 articles total)
        const articles = [
            ...(data1.articles || []),
            ...(data2.articles || [])
        ];

        cache[query] = articles;
        bindData(articles, query);

    } catch (err) {
        console.error("Fetch failed:", err);
        document.getElementById('card-container').innerHTML =
            `<p class="error">⚠️ ${err.message}</p>`;
    }
};

// ── Render cards ───────────────────────────────────────────────────────────────
const bindData = (articles, query) => {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = "";

    if (!articles || articles.length === 0) {
        cardContainer.innerHTML = `<p class="no-results">No articles found for "<strong>${query}</strong>". Try a different keyword.</p>`;
        return;
    }

    let html = "";
    for (const item of articles) {
        const date = new Date(item.publishedAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

        const desc = item.description?.substring(0, 160) || "";
        const imgSrc = item.image || "https://placehold.co/400x220/090915/ffffff?text=PigeonPress";
        const source = item.source?.name || "Unknown";

        html += `
            <div class="card">
                <img
                    src="${imgSrc}"
                    class="card-img-top"
                    alt="News"
                    onerror="this.src='https://placehold.co/400x220/090915/ffffff?text=PigeonPress'"
                >
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="source-and-time">${source} &nbsp;|&nbsp; ${date}</p>
                    <p class="card-text">${desc}</p>
                    <a href="${item.url}" class="btn btn-primary" target="_blank" rel="noopener">Read More</a>
                </div>
            </div>`;
    }

    cardContainer.innerHTML = html;
};

// ── Navigation click (no page reload) ─────────────────────────────────────────
const navLinkClick = (value) => {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    event.target.classList.add('active');
    fetchNews(value);
};

// ── Search ─────────────────────────────────────────────────────────────────────
const searchClick = () => {
    const searchBar = document.getElementById('search-bar');
    const query = searchBar.value.trim();
    if (query) {
        fetchNews(query);
        searchBar.value = "";
    }
};

// Enter key in search bar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-bar')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); searchClick(); }
    });
});

// ── Load on startup ────────────────────────────────────────────────────────────
window.addEventListener('load', () => fetchNews('india'));
