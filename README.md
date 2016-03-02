# r/Kappa emotes
This is a simple tool for generating the emote spritesheet and CSS used on the Kappa subreddit.

## Installation
You must have [node and npm](https://docs.npmjs.com/getting-started/installing-node) installed. Once you do, clone or download this project and run `npm install` in the root dir.

## Usage
All you have to do is add emotes in png format to the `src/emotes` directory. Be sure to give them the exact same name as the code used to generate the emote (not counting the file extension). For example: `Kappa.png`, NOT  `kappa.png`, `greyface.png`, `Kappa.gif`. If the emote code has characters that are problematic in filenames, of if you need multiple codes to generate the same emote, see the "Aliases" section below.

### `npm run build`
This will create all of the relevant files in the `build` directory.

- `sprite1.png`, `sprite2.png`, ...: the efficiently-packed spritesheets.
- `style.css`: the stylesheet.
- `test.html`: a simple test page to make sure all of the emotes are working properly. Open it directly in a browser.
- `reddit.txt`: copy and paste this into a reddit post to demonstrate how to use all of the emotes.

## Configuration

### Aliases

- Problem 1: you want to use "Terrible/::/Emote/::/Name" as your emote code but you can't have slashes and/or colons in a filename.
- Problem 2: you've named your file "ResidentSleeper.png" but you also want to use "SleepFighter4" as its emote code.

Solution: aliases. Simply add your aliases to the `src/aliases.json` file and the build process will sort everything out. The structure is pretty simple:

    {
        "EmoteFilename": [
            "EmoteAliasOne",
            "EmoteAliasTwo",
            ...
        ],
        ...
    }

So, for example, to address Problem 1 you'd first give your file a non-problematic filename, like "TerribleEmoteName.png", then set up your `aliases.json` file like this:

    {
        "TerribleEmoteName": ["Terrible/::/Emote/::/Name"]
    }

If you wanted to add the "SleepFighter4" alias as well:

    {
        "TerribleEmoteName": ["Terrible/::/Emote/::/Name"],
        "ResidentSleeper": ["SleepFighter4"]
    }

And for a whole new generation:

    {
        "TerribleEmoteName": ["Terrible/::/Emote/::/Name"],
        "ResidentSleeper": [
            "SleepFighter4",
            "SleepFighter5"
        ]
    }

## To-do, future development possibilities, etc.

- Integrate with the twitchemotes.com API to always have the most up-to-date global emotes.
- Could potentially use the twitchemotes.com API for sub emotes as well, using a whitelist, but because streamers can change their emotes at any time it could break existing posts with frustrating frequency. Would need to be carefully managed.
- Implement non-stupid HTML generation. lodash template-based maybe--simple. anything's better than string concatenation.
- Better (any) integration with reddit admin. automate via API?
