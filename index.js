var Spritesmith = require('spritesmith');
var fs = require('fs');
var path = require('path');
var CSSJSON = require('cssjson');
var emoteAliases = require('./src/aliases.json');

var emotePath = 'src/emotes';
var buildPath = 'build';

var emotes = fs.readdirSync(emotePath)
    .filter(function(filename) { return path.extname(filename) === '.png'; })
    .map(function(filename) { return path.join(__dirname, emotePath, filename); });

Spritesmith.run({src: emotes}, function handleResult(err, result) {
    if (err) {
        throw err;
    }
    fs.writeFileSync(path.join(__dirname, buildPath, 'sprite.png'), result.image);
    // fs.writeFileSync(path.join(__dirname, buildPath, 'coords.json'), JSON.stringify(result.coordinates));
    
    var cssJson = {};
    var redditTxt = [
        'Code|Emote',
        '--:|:--'
    ]
    var overallSelector = [];
    var html = ['<link rel="stylesheet" href="style.css" />'];
    html.push('<table>');
    for (var key in result.coordinates) {
        var name = path.basename(key, '.png');
        var aliases = emoteAliases[name];
        if (aliases) {
            emoteNames = aliases.concat(name);
        } else {
            emoteNames = [name];
        }
        
        emoteNames.forEach(function(emoteName) {
            var selector = '.flair-' + emoteName + ',a[href="/' + emoteName + '"]:after'
            var coords = result.coordinates[key];
            overallSelector.push('a[href="/' + emoteName + '"]:after');
            cssJson[selector] = {attributes: {
                width: coords.width + 'px',
                height: coords.height + 'px',
                'background-position': (-coords.x) + 'px ' + (-coords.y) + 'px'
            }};
            redditTxt.push(emoteName + '|' + '[](/' + emoteName + ')');
            html.push('<tr><td>' + emoteName + '</td><td><a href="/' + emoteName + '"></a></td></tr>');
        });
    }
    html.push('</table>');
    cssJson[overallSelector.join(',')] = {attributes: {
        cursor: 'default',
        display: 'inline-block',
        'background-image': 'url("sprite.png")',
        'background-repeat': 'no-repeat',
        'content': '" "'
    }};
    fs.writeFileSync(path.join(__dirname, buildPath, 'style.css'), CSSJSON.toCSS({children: cssJson}));
    fs.writeFileSync(path.join(__dirname, buildPath, 'test.html'), html.join(''));
    fs.writeFileSync(path.join(__dirname, buildPath, 'reddit.txt'), redditTxt.join("\n"));
});
