# form_website

Masterschool's form website project (103). Their proposed layout example can be found in [Figma](https://www.figma.com/file/I57o3qgbt6UwqxJZBsfkeY/Web-development-training-assignments?node-id=1%3A4151).

## Credits

Used as resources Masterschool's program (including Udacity and PluralSight) and MDN.

CSS-trics and their [article](https://css-tricks.com/svg-properties-and-css/#svg-shape-morphing) about the use of CSS properties as SVG attributes to get the path's `d` also working in my CSS.

Also thanks to Rahim Afful-Brown for helping locating a data type check issue in `el.mk` on child elements after one of the commits and suggesting modularity.

~~Flexbox trick for not enlarging the last line [by Oriol](https://stackoverflow.com/a/30307820)~~

Manga/Manhwa titles from [Manga Read](https://www.mangaread.org/), especially for the recents section. I mean, I like reading them, but there's a limit of how much I can recall ¯\\\_(ツ)\_/¯ Well, at least recall for a professiona project, if you know what I mean ( ͡° ͜ʖ ͡°)

## Images

- SVG images - original content (lol imagine calling a few vector lines "original")
- Main image - [Gladys Levery](https://gladyslevery.blogspot.com/2021/06/anime-collage-wallpaper-assorted-title.html)
- One Punch Man - [thefandom.net](https://thefandom.net/one-punch-man-live-action/)
- Gachi Akurai - [Top Mangas](https://topmangas.net/wp-content/uploads/2022/03/gachi.jpg)
- Martial Peak - [Martial Peak (MP) Wiki - Fandom](https://martial-peak-mp.fandom.com/wiki/Yang_Kai/Image_Gallery)
- The Last Human - [Anime-Planet](https://www.anime-planet.com/manga/mortals-of-the-doom)
- Boy's Abyss - [Hiperdex](https://hiperdex.com/manga/boys-abyss-engli/)
- The King's Avatar - [Novel Updates](https://www.novelupdates.com/series/the-kings-avatar/)
- Overgeared - [Anime-Planet](https://www.anime-planet.com/manga/overgeared)
- One Piece - [Simon & Schuster](https://www.simonandschuster.co.uk/books/One-Piece-Vol-62/Eiichiro-Oda/One-Piece/9781421541969)
- Omniscient Reader's Viewpoint - [readmng](https://www.readmng.com/omniscient-readers-viewpoint)
- Arcane Sniper - [Genkan](https://genkan.io/manga/4705691304-arcane-sniper)
- Leviathan - [Manga Read](https://www.mangaread.org/manga/leviathan/)
- Updater - [Read Manga](https://www.mangaread.org/manga/updater/)
- Mercenary Enrollment - [Read Manga](https://www.mangaread.org/manga/mercenary-enrollment/)
- Solo Login - [Manga Read](https://www.mangaread.org/manga/i-log-in-alone/)
- Killing Stalking - [Wallpaper Cave](https://wallpapercave.com/killing-stalking-computer-wallpapers)
- Painter of the Night - [Anime-Planet](https://www.anime-planet.com/manga/painter-of-the-night)
- Pian Pian - [Nerdlog](https://www.nerdlog.it/haesin-young-pian-pian-minaccia-azione-legale-contro-mangagogo/)
- Nano Machine - [Manga Read](https://www.mangaread.org/manga/nano-machine/)

## app.js

### `el` object

The `el` object combines a few functions for creating a new element (see "*el.mk examples*" section).

| Function | Use |
| - | - |
| el.mk(tagName, data) | Tag name; Data to apply (optional) |
| el.applyData(node, data) | Node to apply; Data to apply |
| el.addAttributes(node, attrs) | Node to apply; Attributes object (key=attribute, value=value) |
| el.bindEvents(node, events) | Node to apply; Array of events- each item is an array that will be used as the arguments of `addEventListener` |
| el.txt(text) | Text node content (string/number) |
| el.isValidText(text) | `true` if argument is valid value for text node, otherwise `false` |


### `el.mk` examples

`el.mk` syntax:

```
// just tag name
el.mk("span");

// adding some data
el.mk("span", {
	// data goes here
});
```

Valid properties in the data object:

- **id**: the element's id
- **class**: the element's className
- **style**: the element's inline CSS
- **childs**: an array or other iterable object, where each item is either:
  - An element (or any instance of `Node`)
  - A string/number (will be converted into a text node)
- **text**: the text content of the element
  - if both **text** and **childs** are provided, **text** will be ignored
- **attrs**: an object (key -> attribute name, value -> attribute value)
  - If the value provided is structured as an array, `.setAttributeNS` will be used instead, with the first item in the array being the namespace, and the second value being the namespaced attribute's value
  - If an array with only 1 value is provided, the only item will be the namespaced attribute's value and the namespace will be set to `null`
- **events**: an array of events
  - Each item in the array is an array with 2 to 3 items that will be used as the arguments of `addEventListener` (event type, event handler, and useCapture/options object as an optional third argument)
- In the case of an invalid input, a console warning/error will be logged to notify about the cause of the error

For example:

```
const testDiv = el.mk("div", {
    id: "potato",
    class: "my-class",
    attrs: {
        title: "Stop hovering over me!",
        "data-lie": "cake"
    },
    childs: [
        "I will be converted into a text node",
        el.mk("span", {
            style: "color: #c00; background: #ff0;",
            text: "I'm a span!",
            events: [
                ["click", function() {
                    console.log("Span click :)");
                }]
            ]
        })
    ],
    events: [
        ["click", function() {
            console.log("I am a click event");
        }],
        ["click", function() {
            console.log("I am a click event that uses useCapture");
        }, true],
        ["click", function() {
            console.log("I am a click event that only happens ONCE");
        }, {
            once: true
        }]
    ]
});
document.body.appendChild(testDiv);
```