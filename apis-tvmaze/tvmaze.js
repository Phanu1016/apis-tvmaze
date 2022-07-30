"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  // const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${q}`)
  const response = await axios.get(`https://api.tvmaze.com/search/shows`, {params : {q}})
  const datas = response.data
  const shows = []
  for (let data of datas){
    const {id, name, summary} = data.show
    const image = data.show.image.medium == undefined ? "https://tinyurl.com/tv-missing" : data.show.image.medium
    shows.push({id, name, summary, image})
  }
  return shows
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="card">
           <img 
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3 card-img-top">
           <div class="card-body">
             <h5 id="show-name" class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
      );

    $showsList.append($show);  
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`)
  const datas = response.data
  const episodes = []
  for (let data of datas){
    const {id, name, season, number} = data
    episodes.push({id, name, season, number})
  }

  return episodes
}

/** Given episodes, create new 'li' with each episode's information and append to the new 'ul' and append the 'ul' to episodesArea */

function populateEpisodes(episodes) {
  const $ul = $("<ul>")
  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`)
    $ul.append($episode)
  }
  $episodesArea.append($ul)
}

/** Click event listener for episodes button, empty and show the episodesArea and then get showID (and name) to pass on to populateEpisodes() */

$("#shows-list").on("click", ".Show-getEpisodes", async function (evt) {
  $episodesArea.empty()
  $episodesArea.show()

  let showId = $(evt.target).closest(".Show").data("show-id");
  const name = $(evt.target).closest(".card-body").find('#show-name').text()
  $episodesArea.append(`<h5 class="text-primary">${name}</h5>`)
  let episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});
