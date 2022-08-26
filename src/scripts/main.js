/* ================================ *\
    # node-creating functions
\* ================================ */

/* easier function for creating element nodes */

// since we're expected to use addEventListener and createElement a lot in this project
// i figured it would be a lot better to just create a function that combines everything

// validator for text node values (only accept numbers/strings)
function isValidText(v) {
	return ["string", "number"].includes(typeof v);
}

// text node maker
function makeText(s) {
	// only accept strings/numbers, otherwise default to empty string
	return document.createTextNode(isValidText(s) ? s : "");
}

// element maker
function makeEl(tag, data) {
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
								// valid child node
								node.appendChild(child);
							} else if (isValidText(child)) {
								// literal string/number- allow and convert to text node
								node.appendChild(makeText(child));
							} else {
								// invalid child node
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
					// syntax: each item in the events array: ["click", handlerFn, (optional) options or useCapture parameter]
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
							// valid listener arguments
							node.addEventListener(...fnArgs);
						} else {
							// invalid listener arguments
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

/* ================================ *\
    # implementations
\* ================================ */

/* generate menu links */
function updateTopMenu() {
	const menu = document.querySelector("#global-navigation menu");
	// create links to all the [data-section] elements
	document.querySelectorAll("[data-section]").forEach(function(a) {
		let node = makeEl("li", {
			class: "global-navigation-menu-item",
			text: a.getAttribute("data-section"),
			events: [
				["click", function() {
					location.hash = a.id;
				}]
			]
		});
		menu.appendChild(node);
	});
}

updateTopMenu();