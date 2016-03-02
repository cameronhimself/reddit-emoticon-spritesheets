import fs from 'fs';
import path from 'path';
import Spritesmith from 'spritesmith';
import Promise from 'bluebird';
import _ from 'lodash';
import CSSJSON from 'CSSJSON';
import rimraf from 'rimraf';
Promise.promisifyAll(Spritesmith);

const config = {
    emotesPerSpritesheet: 150,
    buildPath: 'build',
    emotePath: 'src/emotes',
    aliases: require('./src/aliases.json')
}

async function main() {
    const allEmotes = fs.readdirSync(config.emotePath)
        .filter(filename => path.extname(filename) === '.png')
        .map(filename => path.join(__dirname, config.emotePath, filename));
    const allEmoteNames = allEmotes.map(emotePath => path.basename(emotePath, '.png'));
    const emoteChunks = _.chunk(allEmotes, config.emotesPerSpritesheet);
    
    // Clean
    rimraf.sync(path.join(config.buildPath, '*'));
    
    // Create spritesheets and CSS
    let cssJson = {};
    const actions = emoteChunks.map(processChunk);
    const results = Promise.all(actions);
    results.then(data => {
        data.forEach((result, i) => {
            cssJson.children = _.extend(cssJson.children, result.cssJson.children);
        });
        fs.writeFile(path.join(__dirname, config.buildPath, 'style.css'), CSSJSON.toCSS(cssJson));
    });
    
    // Create HTML preview
    const html = ['<link rel="stylesheet" href="style.css" />', '<table>'];
    allEmoteNames.forEach(emoteName => {
        getAliases(emoteName).forEach(alias => {
            html.push(`<tr><td>${alias}</td><td><a href="/${alias}"></a></td></tr>`);
        });
    });
    html.push('</table>');
    fs.writeFile(path.join(__dirname, config.buildPath, 'test.html'), html.join(''));
    
    // Create reddit markup
    const redditTxt = ['Emote|Code', '--:|:--'];
    allEmoteNames.forEach(emoteName => {
        getAliases(emoteName).forEach(alias => {
            redditTxt.push(`[](/${alias})|${alias}`);
        });
    });
    fs.writeFile(path.join(__dirname, config.buildPath, 'reddit.txt'), redditTxt.join("\n"));
}

async function getSpritesmithResults(src) {
    return await Spritesmith.runAsync({src: src});
}

function getAliases(emoteName) {
    const aliases = config.aliases[emoteName];
    let emoteNames = [];
    if (aliases) {
        emoteNames = aliases.concat(emoteName);
    } else {
        emoteNames = [emoteName];
    }
    return emoteNames;
}

async function processChunk(chunk, i) {
    const result = { cssJson: { children: {} } };
    const spritesmithResult = await getSpritesmithResults(chunk);
    const overallSelector = [];
    const spriteFilename = `sprite${i+1}.png`;
    
    fs.writeFile(path.join(__dirname, config.buildPath, spriteFilename), spritesmithResult.image);
    for (const filePath in spritesmithResult.coordinates) {
        const emoteName = path.basename(filePath, '.png');
        const coords = spritesmithResult.coordinates[filePath];
        
        getAliases(emoteName).forEach(alias => {
            const selector = `.flair-${alias},a[href="/${alias}"]:after`;
            overallSelector.push(selector);
            result.cssJson.children[selector] = {
                attributes: {
                    width: coords.width + 'px',
                    height: coords.height + 'px',
                    'background-position': (-coords.x) + 'px ' + (-coords.y) + 'px'
                }
            };
        });
    }
    result.cssJson.children[overallSelector] = {
        attributes: {
            cursor: 'default',
            display: 'inline-block',
            'background-image': `url("${spriteFilename}")`,
            'background-repeat': 'no-repeat',
            'content': '" "'
        }
    }
    return result;
}

main();
