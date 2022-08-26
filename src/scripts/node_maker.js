/* easier function for creating element nodes */
/*
	i've decided to make a library-like function just to make life easier and the code cleaner for this project
	i guess this will also work for anyone too hipster for using jQuery like any normal human being
	(if "normal human being" means importing a 100kb library just to add a class to a single span in your website
	and then we wonder why people in r/programmerhumor hate js and are scared of css)
*/
function makeEl(tag, data) {
	/*
		tag -> element name
		data -> {
			class: "marker node",
			id: "my-id",
			attrs: {
				"title": "Stop hovering over me",
				"data-dingus": "cake"
			},
			events: {
				["click", function() {}],
				["click", function() {}, {}],
				["mousemove", function() {}, true]
			}
		}
	*/
	if (!tag) {
		console.error("makeEl :: invalid argument");
		return false;
	}
	const node = document.createElement(tag);
	// check if requires additional attributes/data
	if (data instanceof Object) {
		if (data.hasOwnProperty("text") && data.hasOwnProperty("children")) {
			// .text cannot be used if .children is also declared
			console.warn("makeEl :: text overridden by children:", {text: data.text, children: data.children});
			delete data.text;
		}
		// modify the node based on the data
		for (let prop in data) {
			switch (prop) {
				case "text":
					// text content
					node.textContent = data.text;
					break;
				case "children":
					// try iterating through data.children
					// instead of forEach, to also support array-like data types like HTMLCollection
					try {
						for (let child of data.children) {
							if (child instanceof Node) {
								node.appendChild(child);
							} else {
								console.error("makeEl :: cannot append child that is not a Node instance. Attempted child was:", child);
							}
						}
					} catch(err) {
						console.error("makeEl :: data.children was defined but could not iterate through the property's value:", data.children, err);
					}
					break;
				case "id":
					// id attribute
					node.id = data.id;
					break;
				case "class":
					// class name attribute
					node.className = data.class;
					break;
				case "attrs":
					if (!(data.attrs instanceof Object)) {
						// data.attrs is not an array
						console.error("makeEl :: data.attrs is not an object:", data.attrs);
						continue;
					}
					// attributes
					for (let attr in data.attrs) {
						node.setAttribute(attr, data.attrs[attr]);
					}
					break;
				case "events":
					// event listeners
					/*
					// old syntax: {"mouseup": [], "click": []}
					for (let ev in data.events) {
						if (!(data.events[ev] instanceof Array)) {
							// events must be grouped in arrays, otherwise error + continue
							console.error(`makeEl :: invalid events :: ${ev} value was not an array:`, data.events[ev]);
						}
						data.events[ev].forEach(function(e) {
							node.addEventListener(ev, e);
						});
					}
					*/
					// new syntax: each item in the events array: ["click", handler, optional options or useCapture parameter]
					if (!(data.events instanceof Array)) {
						// data.events is not an array
						console.error("makeEl :: data.events is not an array:", data.events);
						continue;
					}
					data.events.forEach(function(fnArgs) {
						// ["click", fn, optional options or useCapture parameter]
						if (
							fnArgs instanceof Array && // fnArgs is an array
							typeof fnArgs[0] === "string" && // first argument is string (listener type)
							typeof fnArgs[1] === "function" && // second argument is function (actual listener)
							["boolean", "object", "undefined"].includes(typeof fnArgs[2]) // third argument is boolean (useCapture)/object (options)/null/undefined
						) {
							//node.addEventListener.apply(null, fnArgs);
							//EventTarget.prototype.addEventListener.apply(node, fnArgs);
							///node.addEventListener(fnArgs[0], fnArgs[1], fnArgs[2]);
							//EventTarget.prototype.addEventListener.apply(node, fnArgs);
							node.addEventListener(...fnArgs);
						} else {
							console.warn("makeEl :: invalid listener in the events list:", fnArgs);
						}
					});
					break;
				default:
					// unsupported object property
					console.warn("makeEl :: data contains unsupported property:", prop, data[prop]);
			}
		}
	}
	return node;
}

/* same as makeEl but for text nodes */
function makeText(s) {
	// only accept strings/numbers, otherwise default to empty string
	return document.createTextNode(["string", "number"].includes(typeof s) ? String(s) : "");
}



/*
s = makeEl("div", {
	text: "foobar1",
	id: "first",
	class: "myclass",
	attrs: {
		title: "mytitle",
		"data-foo": "cake"
	},
	events: [
		["click", e => {
			console.log(this, e.target);
		}]
	]
});
document.body.appendChild(s);

s = makeEl("div", {
	text: "foobar 2",
	id: "second",
	class: "myclass",
	attrs: {
		title: "mytitle",
		"data-foo": "cake"
	},
	events: [
		["click", e => {
			console.log(this, e.target);
		}]
	]
});
document.body.appendChild(s);

document.body.appendChild(makeEl("section", {
	text: "foobar 2",
	children: [
		makeEl("div", {
			text: "div inside section"
		}),
		document.createTextNode("text node")
	],
	id: "second",
	class: "myclass",
	attrs: {
		title: "mytitle",
		"data-foo": "cake"
	},
	events: [
		["click", e => {
			console.log(this, e.target);
		}]
	]
}));
*/