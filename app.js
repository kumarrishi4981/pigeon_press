// Fetch News from Netlify Function
const fetchNews = async (query) => {
    try {
        let response = await fetch(`/.netlify/functions/getNews?query=${query}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        let data = await response.json();
        bindData(data.articles);
    } catch (error) {
        console.error("Failed to fetch news:", error);
        document.getElementById('card-container').innerHTML =
            `<p class="error">Could not load articles. Please try again later.</p>`;
    }
};

// Bind articles to cards
const bindData = (articles) => {
    let cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ""; // clear old articles

    if (!articles || articles.length === 0) {
        cardContainer.innerHTML = `<p class="no-results">No articles found.</p>`;
        return;
    }

    let cardHtml = "";

    for (let item of articles) {
        if (!item.image) continue; // ✅ GNews uses "image"

        let date = new Date(item.publishedAt).toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
        });

        cardHtml += `
            <div class="card">
                <img src="${item.image}" class="card-img-top" alt="News Image">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="source-and-time">${item.source?.name || "Unknown"} | ${date}</p>
                    <p class="card-text">${item.description || ""}</p>
                    <a href="${item.url}" class="btn btn-primary" target="_blank">Read More</a>
                </div>
            </div>
        `;
    }

    cardContainer.innerHTML = cardHtml;
};

// Navbar category click
const navLinkClick = (value) => fetchNews(value);

// Search
let searchClick = () => {
    let searchBar = document.getElementById('search-bar');
    let data = searchBar.value.trim();
    if (data) {
        fetchNews(data);
        searchBar.value = ""; // ✅ clear search
    }
};

// Load default news
window.addEventListener('load', () => fetchNews('General'));
