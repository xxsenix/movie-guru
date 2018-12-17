'use strict';

function createYouTubeVidString(videos) {

$('#results-list').append(
    `<div><iframe src="https://www.youtube.com/embed/${videos[0].id.videoId}" allow="autoplay; encrypted-media" width="350" height="200" frameborder="0" allowFullScreen></iframe></div>`
    );
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }

function getYouTubeVideoId(movieTitle) {

    console.log(movieTitle);

    const searchURL = 'https://www.googleapis.com/youtube/v3/search';
    const apiKey = 'AIzaSyDew9bnIv-VFtNqJhIj8FGjc2FVx3JK864';
    const params = {
        key: apiKey,
        q: `${movieTitle} movie trailer`,
        part: 'snippet',
        maxResults: 1,
        type: 'video'
    };
    const queryString = formatQueryParams(params);
    const url = searchURL + '?' + queryString;

    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => createYouTubeVidString(responseJson.items))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayMovieList(movies) {

    getYouTubeVideoId(movies.title);

    $('#results-list').append(
        `<li>
        <img class='movie-poster' src='https://image.tmdb.org/t/p/w1280${movies.poster_path}'>
        <h3 class='summary'>${movies.title}</h3>
        <p class='summary'>${movies.overview}</p>
        <p class='summary'>Rating: ${movies.vote_average * 10}</p>
        </li>`
    );

    $('#results').removeClass('hidden');
}

function getMovieInfo(movieID) {
    const theMovieDbInfoURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US`
    
    $.ajax({
        url: theMovieDbInfoURL,
        dataType: 'jsonp',
        success: function(data){
          displayMovieList(data);
        },
        error: function(err){
          console.log(err)
        }
     });
}

function getMovieID(recommendations) {
    
    let results = recommendations.Similar.Results;
    
    for(let i = 0; i < results.length; i++) {

        const theMovieDbIdURL = `https://api.themoviedb.org/3/search/movie?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US&query=${results[i].Name}`;

        $.ajax({
            url: theMovieDbIdURL,
            dataType: 'jsonp',
            success: function(data){
            //Only want the first result here as it is the most relevant one
                let movieID = data.results[0].id;
                getMovieInfo(movieID);
            },
            error: function(err){
                console.log(err)
            }
            });
    }
}

function getSimilarMovies(movie) {
    const tasteDiveURL = `https://tastedive.com/api/similar?k=325596-MovieGur-SYAEXVER&type=movies&q=${movie}&limit=5`;

    $.ajax({
        url: tasteDiveURL,
        dataType: 'jsonp',
        success: function(data){
          getMovieID(data);
        },
        error: function(err){
          console.log(err)
        }
     });
    }
//listens for submit button to be pushed, takes the value of that input and passes it to js-search-movies
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        $('#results-list').empty();
        const movieName = $('#js-search-movies').val();
        getSimilarMovies(movieName);
    });
}

$(watchForm);