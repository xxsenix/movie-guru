'use strict';

function createYouTubeVidString(videos, movieID) {

$(`#video-${movieID}`).html(
    `<iframe src="https://www.youtube.com/embed/${videos[0].id.videoId}" allow="autoplay; encrypted-media" width="350" height="200" frameborder="0" allowFullScreen></iframe>`
    );
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }

function getYouTubeVideoId(movieTitle, movieID) {

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
    .then(responseJson => createYouTubeVidString(responseJson.items, movieID))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayMovieList(movies) {
    console.log(movies);
    getYouTubeVideoId(movies.title, movies.id);

    $('#results-list').append(
        `<li>
            <div class="row">
                <div class="col-6">
                    <img class='movie-poster' src='https://image.tmdb.org/t/p/w1280${movies.poster_path}'>
                </div>
                <div class="col-6">
                    <h3 class='summary' id="movie-title">${movies.title} <span><i class="fa fa-film" aria-hidden="true"></i></span></h3>
                    <p class='summary'>${movies.overview}</p>
                    <div class="youtube-video" id="video-${movies.id}"></div>
                </div>
            </div>
        </li>`
    );

    $('#results').removeClass('hidden');
}

function getMovieInfo(data) {

    console.log(data)

    let movieID = data[0].id;

    const theMovieDbInfoURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US`
    
    $.ajax({
        url: theMovieDbInfoURL,
        dataType: 'jsonp',
        success: function(data){
          displayMovieList(data);
        },
        error: function(err){
          console.log(err);
        }
     });
}

function getMovieID(recommendations) {
    
    let results = recommendations.Similar.Results;
    
    for(let i = 0; i < results.length; i++) {

        const theMovieDbIdURL = `https://api.themoviedb.org/3/search/movie?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US&query=${encodeURIComponent(results[i].Name)}`;

        $.ajax({
            url: theMovieDbIdURL,
            dataType: 'jsonp',
            success: function(data){
            //Only want the first result here as it is the most relevant one
            getMovieInfo(data.results);
            },
            error: function(err){
                console.log(err)
            }
            });
    }
}

function getSimilarMovies(movie) {
    const tasteDiveURL = `https://tastedive.com/api/similar?k=325596-MovieGur-SYAEXVER&type=movies&limit=5&verbose=1&q=${encodeURIComponent(movie)}`;

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

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        $('#results-list').empty();
        const movieName = $('#js-search-movies').val();
        getSimilarMovies(movieName);
    });
}

$(watchForm);