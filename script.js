'use strict';

function displayMovieList(movies) {

    console.log(movies);
    // $('#results-list').empty();

    // $('#results-list').html(
    //     `<li><h3>${movies.title}</h3></li>`
    // );

    // $('#results').removeClass('hidden');
}

function getMovieInfo(movieID) {
    const theMovieDbInfoURL = `https://api.themoviedb.org/3/movie/${movieID}?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US`
    
    $.ajax({
        url: theMovieDbInfoURL,
        dataType: 'jsonp',
        success: function(data){
        //Only want the first result here as it is the most relevant one
          displayMovieList(data);
        },
        error: function(err){
          console.log(err)
        }
     });
}

function getMovieID(movieList) {

    const results = movieList.Similar.Results;

    for(let i = 0; i < results.length; i++) {
        console.log(results[i].Name);
        const theMovieDbIdURL = `https://api.themoviedb.org/3/search/movie?api_key=2254751051c6a0ba6ea30e3dfd393cc9&language=en-US&query=${results[i].Name}&page=1`;
        
        $.ajax({
            url: theMovieDbIdURL,
            dataType: 'jsonp',
            success: function(data){
            //Only want the first result here as it is the most relevant one
              getMovieInfo(data.results[0].id);
            },
            error: function(err){
              console.log(err)
            }
         });
    }
}

function getSimilarMovies(movie) {
    const tasteDiveURL = `https://tastedive.com/api/similar?k=325596-MovieGur-SYAEXVER&q=${movie}`;

    $.ajax({
        url: tasteDiveURL,
        dataType: 'jsonp',
        success: function(data){
        //call function here instead of console.logging
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
    })
}

$(watchForm);