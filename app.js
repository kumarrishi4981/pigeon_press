// =====================================================
//  PigeonPress — News App
//  Local:      Direct GNews API (CORS allowed on localhost)
//  Production: Netlify Function proxy (no CORS issues)
// =====================================================

const IS_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_KEY = "3fd70ca553d31d5b7675095d1f8f37ea"; // used only on localhost
const BASE = "https://gnews.io/api/v4";

const TOPIC_MAP = {
    india: "nation",
    sports: "sports",
    politics: "politics",
    entertainment: "entertainment",
    general: "breaking-news",
};

// In-memory cache to save API quota
const cache = {};

// ── Main fetch function ────────────────────────────────────────────────────────
const fetchNews = async (query) => {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = `
        <div class="loading-wrap">
            <div class="spinner"></div>
            <p>Loading articles...</p>
        </div>`;

    const cacheKey = query.toLowerCase();
    if (cache[cacheKey]) {
        bindData(cache[cacheKey], query);
        return;
    }

    try {
        let articles = [];

        if (IS_LOCAL) {
            // ── LOCAL: call GNews API directly ──────────────────────────────
            const key = query.toLowerCase();
            let url1, url2;

            if (TOPIC_MAP[key]) {
                const base = `${BASE}/top-headlines?topic=${TOPIC_MAP[key]}&lang=en&country=in&max=6&apikey=${API_KEY}`;
                url1 = base + "&page=1";
                url2 = base + "&page=2";
            } else {
                const base = `${BASE}/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=6&sortby=publishedAt&apikey=${API_KEY}`;
                url1 = base + "&page=1";
                url2 = base + "&page=2";
            }

            const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);

            if (res1.status === 403) throw new Error("Invalid API key.");
            if (res1.status === 429) throw new Error("Daily limit reached (100 req/day on free plan).");
            if (!res1.ok) throw new Error(`GNews API Error: ${res1.status}`);

            const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
            articles = [...(data1.articles || []), ...(data2.articles || [])];

        } else {
            // ── PRODUCTION: call Netlify function (no CORS issues) ──────────
            const res = await fetch(`/.netlify/functions/getNews?query=${encodeURIComponent(query)}`);

            if (!res.ok) throw new Error(`Function error: ${res.status}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            articles = data.articles || [];
        }

        cache[cacheKey] = articles;
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

// ── Navigation ─────────────────────────────────────────────────────────────────
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-bar')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); searchClick(); }
    });
});

// ── Load default ───────────────────────────────────────────────────────────────
window.addEventListener('load', () => fetchNews('india'));
