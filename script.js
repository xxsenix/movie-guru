'use strict';

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        $('#results-list').empty();
        const movieName = $('#js-search-movies').val();
        console.log(movieName);
    })
}

$(watchForm);