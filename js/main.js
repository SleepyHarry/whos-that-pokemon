var SPRITE_HEIGHT = 96,
    ZOOM = 6;

var greyed = false,
    candied = false;

var currentPoke;

var spriteData = [];
for (var i=0; i < SPRITE_HEIGHT; i++) {
    spriteData.push([]);
}

var rgbToHex = function (rgbObj) {
    var r = rgbObj.r.toString(16),
        g = rgbObj.g.toString(16),
        b = rgbObj.b.toString(16);

    if (r.length === 1) r = '0' + r;
    if (g.length === 1) g = '0' + g;
    if (b.length === 1) b = '0' + b;

    return '#' + r + b + g;
};

var pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

var makeSrc = function (s) {
    s += '';

    var pad = '000',
        padded = pad.substring(0, pad.length - s.length) + s;

    return 'res/sprites/' + padded + '.png';
};

var getSpriteData = function (canvas, context) {
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;

    for (var x=0; x<SPRITE_HEIGHT; x++) {
        for (var y=0; y<SPRITE_HEIGHT; y++) {
            var i = (y * canvas.width + x) * 4;

            var hexColor = (imgData[i + 3] ? rgbToHex({r: imgData[i], b: imgData[i+1], g: imgData[i+2]}) : null);

            spriteData[x][y] = hexColor;
        }
    }
};

var loadPoke = function (number) {
    var canvas = document.getElementById('pokemon'),
        context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    var pokeImg = new Image();
    pokeImg.src = makeSrc(number);

    pokeImg.onload = function() {
        context.drawImage(pokeImg, 0, 0, SPRITE_HEIGHT, SPRITE_HEIGHT,
            0, 0, SPRITE_HEIGHT, SPRITE_HEIGHT);
        getSpriteData(canvas, context);
        if (candied) { drawCandy(); } else { drawPoke(); }
    };
};

var drawPoke = function () {
    var canvas = document.getElementById('pokemon');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < SPRITE_HEIGHT; i++) {
        for (var j = 0; j < SPRITE_HEIGHT; j++) {
            if (greyed) context.fillStyle = (spriteData[i][j] && 'rgb(64,64,64)' || 'rgba(0,0,0,0.0)');
            else context.fillStyle = (spriteData[i][j] || 'rgba(0,0,0,0.0)');
            context.fillRect(i * ZOOM, j * ZOOM, ZOOM, ZOOM);
        }
    }
};

var drawCandy = function () {
    var canvas = document.getElementById('pokemon');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    var fillStyles = [],
        colourTop = 0,
        colourBottom = SPRITE_HEIGHT;
    for (var j = 0; j < SPRITE_HEIGHT; j++) {
        var modalColour = mode(spriteData.map(d => d[j]));
        fillStyles.push(modalColour);

        if (modalColour !== undefined) {
            colourTop = colourTop || j;
            colourBottom = colourBottom && j;
        }
    }

    var radius = (colourBottom - colourTop) / 2;

    for (var j = 0; j < SPRITE_HEIGHT; j++) {
        if (fillStyles[j] === undefined) continue;

        //var w = Math.min(j - colourTop, colourBottom - j),
        var w = Math.floor(2 * radius * Math.cos(Math.asin(1 - Math.min(j - colourTop, colourBottom - j) / radius))),
            x = (SPRITE_HEIGHT - w) / 2;

        // basic border
        //context.fillStyle = 'rgb(0,0,0)';
        //context.fillRect(x * ZOOM - 1, j * ZOOM, w * ZOOM + 2, ZOOM + 1);

        context.fillStyle = fillStyles[j] || 'rgba(0,0,0,0.0)';
        context.fillRect(x * ZOOM, j * ZOOM,  w * ZOOM, ZOOM);
    }
};

// Adapted with love from http://codereview.stackexchange.com/a/68342
var mode = function mode(arr) {
    var mapping = {};
    var greatestFreq = 0;
    var mode;
    arr.forEach(function findMode(x) {
        if (x === null) return;

        mapping[x] = (mapping[x] || 0) + 1;

        if (greatestFreq < mapping[x]) {
            greatestFreq = mapping[x];
            mode = x;
        }
    });
    return mode;
};

var newPoke = function (from) {
    currentPoke = pickRandom(from);

    loadPoke(currentPoke.number);
};

var filterGens = function (pokemon) {
    var checkboxes = $('.generation-checkbox');

    var filteredIn = [];
    checkboxes.each(function () {
        filteredIn.push(this.checked);
    });

    var filtered = pokemon.filter(d => filteredIn[d.generation - 1]);

    return filtered;
};

$.getJSON('res/names.json', function (pokemon) {
    var filteredPokemon = filterGens(pokemon);

    var canvas = $('canvas');
    canvas.click(function () {
        filteredPokemon = filterGens(pokemon);

        if (filteredPokemon.length !== 0) newPoke(filteredPokemon);
    });

    newPoke(filteredPokemon);
});