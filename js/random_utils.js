// helper functions pertaining to randomness

function choose_random( array ) {
        var i = Math.floor(Math.random()*array.length)
        return array[i]
}

function choose_range( start, end ) {
        return Math.floor(Math.random() * (end-start)) + start
}
