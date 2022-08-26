/* ================================ *\
    # node-creating functions
\* ================================ */

/* easier function for creating element nodes */

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
				case "childs":
					// try iterating through data.children
					// instead of forEach, to also support array-like data types like HTMLCollection
					try {
						for (let child of data.childs) {
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
						console.error("makeEl :: data.childs was defined but could not iterate through the property's value:", data.childs, err);
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
				case "style":
					// style attribute
					node.style.cssText = data.style;
					break;
				case "attrs":
					if (!(data.attrs instanceof Object)) {
						// data.attrs is not an array
						console.error("makeEl :: data.attrs is not an object:", data.attrs);
						continue;
					}
					// attributes
					for (let attr in data.attrs) {
						let curr = data.attrs[attr];
						if (curr instanceof Array) {
							// array value for custom namespace (e.g. for svg, tho don't think i'll implement it in this project)
							if (curr.length === 1) {
								// 1-item array- namespace set to null
								node.setAttributeNS(null, attr, curr[0]);
							} else {
								// any other array- define the namespace
								node.setAttributeNS(curr[0], attr, curr[1]);
							}
						} else {
							node.setAttribute(attr, curr);
						}
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
						console.log(fnArgs);
						if (
							fnArgs instanceof Array && // fnArgs is an array
							typeof fnArgs[0] === "string" && // first argument is string (listener type)
							typeof fnArgs[1] === "function" && // second argument is function (actual listener)
							["boolean", "object", "undefined"].includes(typeof fnArgs[2]) // third argument is boolean (useCapture)/object (options)/null/undefined
						) {
							// valid listener arguments
							console.log("valid", fnArgs);
							node.addEventListener(...fnArgs);
						} else {
							console.log("invalid", fnArgs);
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
(function() {
	const menu = document.querySelector("#global-navigation menu");
	// create links to all the [data-section] elements
	document.querySelectorAll("[data-section]").forEach(function(section) {
		let node = makeEl("li", {
			class: "global-navigation-menu-item",
			text: section.dataset.section,
			events: [
				["click", function() {
					section.scrollIntoView({
						behavior: "smooth"
					});
				}]
			]
		});
		menu.appendChild(node);
	});
}());

/* back to top button */
(function() {
	const btn = makeEl("div", {
			id: "back-to-top",
			events: [
				["click", function() {
					location.href = "#";
				}]
			]
		}),
		gn = document.querySelector("#global-navigation");
	function updateBtn() {
		const isBelowHeading = gn.getBoundingClientRect().bottom <= 0; // if scrolled/jumped past the heading
		btn.classList.toggle("back-to-top-hidden", !isBelowHeading);
	}
	updateBtn();
	["hashchange", "scroll"].forEach(function(eventType) {
		document.addEventListener(eventType, updateBtn);
	});
	document.body.appendChild(btn);
}());



/* for debugging */
(function() {
	try {
		document.querySelector('[name="sbsc-fullname"]').value = "My Name";
		document.querySelector('[name="sbsc-email"]').value = "foomail@test.com";
		//document.querySelector('[name="sbsc-phone"]').value = "6";
		document.querySelector('[name="sbsc-subject"]').value = "Some subject title";
		document.querySelector('[name="sbsc-textbody"]').value = "She sells sheashells by the seashore.";
	} catch(err) {}
}());