# form_website

Masterschool's form website project (103). Their proposed layout example can be found in [Figma](https://www.figma.com/file/I57o3qgbt6UwqxJZBsfkeY/Web-development-training-assignments?node-id=1%3A4151).

## Credits

Used as resources Masterschool's program (including Udacity and PluralSight) and MDN.

CSS-trics and their [article](https://css-tricks.com/svg-properties-and-css/#svg-shape-morphing) about the use of CSS properties as SVG attributes to get the path's `d` also working in my CSS.

Also thanks to Rahim Afful-Brown for helping locating a data type check issue in `el.mk` on child elements after one of the commits.

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