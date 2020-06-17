Search = {
    initSearch: function() {
        // fuzzy search stuff
        Search.getPreLoadSuggestions();
    },
    autocompleteData: {},
    searchables: [],
    // Make search is ready before initializing.
    // Only available on pages with a search form and the custom search input.
    isReady: function(form, input) {
        if ($(form) && $(input)) {
            return true;
        } else {
            return false;
        }
    },
    // Helper to remove non unique values from array.
    filter: function(collection) {
        for (var a = 0; a < collection.length; a++) {
            for (var b = a + 1; b < collection.length; b++) {
                if (collection[a] === collection[b]) {
                    collection.splice(b, 1);
                }
            }
        }

        return collection;
    },
    getPreLoadSuggestions: function(query) {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: '/searchsuggestions/',
            success: function(res) {
                Search.searchables = Search.filter(res);
                $.map(Search.searchables, function(term) {
                    Search.autocompleteData[term] = null;
                });
                $('.autocomplete').autocomplete('updateData', Search.autocompleteData);
            },
            error: function(res) {
                console.log('There is something wrong with the getPreLoadSuggestions axaj call');
                console.log(res);
            }
        });
    }
};

$(document).ready(function() {
    if (Search.isReady('form#search', 'input#search_input')) {
        Search.initSearch();
    }
});

$('form#search  div input#search_input').on('keyup change paste', Search.getPreLoadSuggestions);
