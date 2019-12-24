"use strict";
//Displays the movie trailer to the appropriate place in the DOM
function createYouTubeVidString(videos, movieID) {
  $(`#video-${movieID}`).html(
    `<iframe class="youtube-video" src="https://www.youtube.com/embed/${videos[0].id.videoId}" allow="autoplay" encrypted-media" width="350" height="200" frameborder="0" allowFullScreen></iframe>`
  );
}
//Formats the parameters for the request to YouTube's API
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}
//Searches YouTube's API for a movie trailer
function getYouTubeVideoId(movieTitle, movieID) {
  const searchURL = "https://www.googleapis.com/youtube/v3/search";
  const apiKey = "AIzaSyDew9bnIv-VFtNqJhIj8FGjc2FVx3JK864";
  const params = {
    key: apiKey,
    q: `${movieTitle} movie trailer`,
    part: "snippet",
    maxResults: 1,
    type: "video"
  };
  const queryString = formatQueryParams(params);
  const url = searchURL + "?" + queryString;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => createYouTubeVidString(responseJson.items, movieID))
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}
//Displays the results to the DOM
function displayMovie(movie) {
  getYouTubeVideoId(movie.title, movie.id);

  let releaseDate = movie.release_date;
  //Only want the year
  let year = releaseDate.substring(0, 4);

  $("#results-list").append(
    `<li>
            <div class="row">
                <div class="col-6">
                    <img class='movie-poster' src='https://image.tmdb.org/t/p/w1280${movie.poster_path}'>
                </div>
                <div class="col-6">
                    <h3 class='summary' id="movie-title"><a href="https://www.imdb.com/title/${movie.imdb_id}" target="_blank">${movie.title}</a> (${year}) <span><i class="fa fa-film" aria-hidden="true"></i></span></h3>
                    <p class='summary'>${movie.overview}</p>
                    <div class="video-container" id="video-${movie.id}"></div>
                </div>
            </div>
        </li>`
  );

  $("#results").removeClass("hidden");
}
//Using the movie ID, we obtain information about the movie from the same API (TheMovieDB)
function getMovieInfo(data) {
  //Only want the first one here as it's the most relevant
  let movieID = data[0].id;

  const theMovieDbInfoURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US`;

  $.ajax({
    url: theMovieDbInfoURL,
    dataType: "jsonp",
    success: function(data) {
      displayMovie(data);
    },
    error: function(err) {
      console.log(err);
    }
  });
}
//For each recommendation, search TheMovieDB's API for an ID
function getMovieID(recommendations) {
  let results = recommendations.Similar.Results;

  if (results.length === 0) {
    $("#js-error-message").html(
      `<i class="fas fa-exclamation-triangle"></i>
            <p>Hmmm, it doesn't look like we know that one.</p>`
    );
    $("#results").removeClass("hidden");
  } else {
    for (let i = 0; i < results.length; i++) {
      const theMovieDbIdURL = `https://api.themoviedb.org/3/search/movie?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US&query=${encodeURIComponent(
        results[i].Name
      )}`;

      $.ajax({
        url: theMovieDbIdURL,
        dataType: "jsonp",
        success: function(data) {
          getMovieInfo(data.results);
        },
        error: function(err) {
          console.log(err);
        }
      });
    }
  }
}
//Using TasteDive's API, gets a list of movie recommendations
function getSimilarMovies(movie) {
  const tasteDiveURL = `https://tastedive.com/api/similar?k=325596-MovieGur-SYAEXVER&type=movies&limit=5&verbose=1&q=${encodeURIComponent(
    movie
  )}`;

  $.ajax({
    url: tasteDiveURL,
    dataType: "jsonp",
    success: function(data) {
      getMovieID(data);
    },
    error: function(err) {
      console.log(err);
    }
  });
}
//Listens for user input, passes that movie name to getSimilarMovies
function watchForm() {
  $("form").submit(event => {
    event.preventDefault();
    $("#results-list").empty();
    $("#js-error-message").empty();
    const movieName = $("#js-search-movies").val();
    getSimilarMovies(movieName);
  });
}

$(watchForm);
