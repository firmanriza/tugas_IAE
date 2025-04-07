const apiURL = "https://api.disneyapi.dev/character";

window.onload = () => {
  fetch(`${apiURL}?page=1`)
    .then(res => res.json())
    .then(data => showMovies(data.data));
};

document.getElementById("search").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  fetch(`${apiURL}?name=${query}`)
    .then(res => res.json())
    .then(data => showMovies(data.data));
});

function showMovies(movies) {
  const container = document.getElementById("movies");
  container.innerHTML = "";
  movies.forEach(movie => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="card h-100 shadow">
        <img src="${movie.imageUrl}" class="card-img-top" alt="${movie.name}">
        <div class="card-body">
          <h5 class="card-title">${movie.name}</h5>
          <a href="/character/${movie._id}" class="btn btn-primary mt-2">Lihat Detail</a>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}
