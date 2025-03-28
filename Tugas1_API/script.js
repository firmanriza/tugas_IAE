const API_BASE = "https://api.tvmaze.com";

// mengambil daftar acara populer 
async function getPopularShows() {
    const popularShowIds = [1, 2, 3, 4, 5, 6, 7, 8]; 
    try {
        const requests = popularShowIds.map(id => fetch(`${API_BASE}/shows/${id}`).then(res => res.json()));
        const shows = await Promise.all(requests);
        displayResults(shows.map(show => ({ show })));
    } catch (error) {
        console.error("Error saat mengambil acara populer:", error);
    }
}

//  mencari acara TV
async function searchShow(query) {
    try {
        const response = await fetch(`${API_BASE}/search/shows?q=${encodeURIComponent(query)}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error saat pencarian:", error);
        throw error;
    }
}

// mendapatkan daftar episode
async function getEpisodes(showId) {
    try {
        const response = await fetch(`${API_BASE}/shows/${showId}/episodes`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error saat mengambil episode:", error);
        throw error;
    }
}

// menampilkan acara TV dalam grid
function displayResults(shows) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (shows.length === 0) {
        resultsDiv.innerHTML = '<p class="error">Tidak ada hasil ditemukan.</p>';
        return;
    }

    shows.forEach(item => {
        const show = item.show;
        const card = document.createElement("div");
        card.className = "tv-card";
        card.innerHTML = `
            <img src="${show.image?.medium || 'https://via.placeholder.com/210'}" alt="${show.name}">
            <h2>${show.name}</h2>
            <p>${show.summary ? show.summary.replace(/<[^>]*>/g, "").substring(0, 100) + '...' : 'Deskripsi tidak tersedia.'}</p>
            <button onclick="showEpisodes(${show.id})">Lihat Episode</button>
        `;
        resultsDiv.appendChild(card);
    });
}

// menampilkan daftar episode
async function showEpisodes(showId) {
    const episodes = await getEpisodes(showId);
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `<h2>Daftar Episode</h2><div class="episode-grid"></div>`;

    const gridDiv = resultsDiv.querySelector(".episode-grid");

    episodes.forEach(episode => {
        const episodeDiv = document.createElement("div");
        episodeDiv.className = "episode-card";
        episodeDiv.innerHTML = `
            <img src="${episode.image?.medium || 'https://via.placeholder.com/210'}" alt="${episode.name}">
            <h3>${episode.name}</h3>
            <p>Season ${episode.season}, Episode ${episode.number}</p>
            <p>${episode.summary ? episode.summary.replace(/<[^>]*>/g, "").substring(0, 100) + '...' : 'Deskripsi tidak tersedia.'}</p>
            <a href="${episode.url}" target="_blank">
                <button>Lihat di TV Maze</button>
            </a>
        `;
        gridDiv.appendChild(episodeDiv);
    });
}


// Event listener untuk pencarian
document.getElementById("searchButton").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value.trim();
    const messageDiv = document.getElementById("message");

    if (!query) {
        messageDiv.innerHTML = '<p class="error">Masukkan kata kunci pencarian.</p>';
        return;
    }

    messageDiv.innerHTML = '<p class="loading">Memuat data...</p>';

    try {
        const shows = await searchShow(query);
        messageDiv.innerHTML = "";
        displayResults(shows);
    } catch (error) {
        messageDiv.innerHTML = '<p class="error">Terjadi kesalahan saat mengambil data.</p>';
    }
});

// tampilkan acara TV populer
document.addEventListener("DOMContentLoaded", getPopularShows);