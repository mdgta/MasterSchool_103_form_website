/* ================================ *\
    # node-creating functions
\* ================================ */

/* easier function for creating element nodes */

const el = {};

// validator for text node values (only accept numbers/strings)
el.isValidText = function(v) {
	return ["string", "number"].includes(typeof v);
}

// create text node
el.txt = function(s) {
	// only accept strings/numbers, otherwise default to empty string
	return document.createTextNode(el.isValidText(s) ? s : "");
}

// create element
el.mk = function(tag, data) {
	if (!tag) {
		console.error("el.mk :: invalid argument");
		return false;
	}
	const node = document.createElement(tag);
	// check if requires additional attributes/data
	if (data) {
		el.applyData(node, data);
	}
	return node;
}

// bind events to element
el.bindEvents = function(node, events) {
	// syntax: each item in the events array: ["click", handlerFn, (optional) options or useCapture parameter]
	if (!(events instanceof Array)) {
		// events is not an array
		console.error("el.bindEvents :: events not an array:", events);
		return node;
	}
	events.forEach(function(fnArgs) {
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
			console.warn("el.bindEvents :: invalid listener in the events list:", fnArgs);
		}
	});
	return node;
}

// add attributes
el.addAttributes = function(node, attrs) {
	if (!(attrs instanceof Object)) {
		// attrs is not an array
		console.error("el.addAttributes :: attrs is not an object:", attrs);
		return node;
	}
	for (let attr in attrs) {
		let curr = attrs[attr];
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
	return node;
}

// add child nodes
el.addChildNodes = function(node, childs) {
	// try iterating through childs
	// instead of forEach, to also support array-like data types like HTMLCollection
	try {
		for (let child of childs) {
			if (child instanceof Node) {
				// valid child node
				node.appendChild(child);
			} else if (el.isValidText(child)) {
				// literal string/number- allow and convert to text node
				node.appendChild(el.txt(child));
			} else {
				// invalid child node
				console.error("el.addChildNodes :: cannot append child that is not a Node instance. Attempted child was:", {parent: node, childToAppend: child});
			}
		}
	} catch(err) {
		console.error("el.addChildNodes :: childs was defined but could not iterate through the property's value:", childs, err);
	}
	return node;
}

// handle data application on element
el.applyData = function(node, data) {
	if (!data instanceof Object) {
		// invalid data
		console.warn("el.applyData :: Unable to apply data structure to node", {node: node, data: data});
		return node;
	}
	if (data.hasOwnProperty("text") && data.hasOwnProperty("childs")) {
		// .text cannot be used if .childs is also declared
		console.warn("el.applyData :: text overridden by childs:", {text: data.text, childs: data.childs});
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
				el.addChildNodes(node, data.childs);
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
				// attributes
				el.addAttributes(node, data.attrs);
				break;
			case "events":
				// event listeners
				el.bindEvents(node, data.events);
				break;
			default:
				// unsupported object property
				console.warn("el.applyData :: data contains unsupported property:", prop, data[prop]);
		}
	}
	return node;
}

/* miscellaneous functions */

// check if in mobile/tablet OR desktop

// format date
function formatDate(s) {
	// s = "[A-Z][a-z]{2} \d{2}"
	// e.g. "Aug 03"
	return s.replace(/^[a-z]+/i, function(m) {
		const months = {
			Jan: "January",
			Feb: "February",
			Mar: "March",
			Apr: "April",
			May: "May",
			Jun: "June",
			Jul: "July",
			Aug: "August",
			Sep: "September",
			Oct: "October",
			Nov: "November",
			Dec: "December"
		};
		return months[m];
	}).replace(/\d+$/, function(m) {
		return Number(m);
	});
}

// if is large screen (desktop)
function isLargeScreen() {
	return screen.availWidth >= 720;
}

// change marker on selected top navigation links based on scroll position
function updateNavFocusMarker() {
	const currMarked = document.querySelector(".global-navigation-menu-item-focused"),
		menuItems = document.querySelectorAll("#global-navigation li"),
		sections = document.querySelectorAll("[data-section]");
	let section,
		bbox;
	if (currMarked) {
		// remove current marker (if exists)
		currMarked.classList.remove("global-navigation-menu-item-focused");
	}
	// loop through the sections (in reversed order) to find the last-selected item
	for (let i = 0; i < sections.length; i++) {
	//for (let i = sections.length - 1; 0 <= i; i--) {
		section = sections[i];
		bbox = section.getBoundingClientRect();
		if (bbox.top + bbox.height >= getGlobalHeaderHeight()) {
			// last scrolled-past section- mark as current
			menuItems[i].classList.add("global-navigation-menu-item-focused");
			break;
		}
	}
}

// get global header height
function getGlobalHeaderHeight() {
	// just thought of maybe changing the height for desktop in case i'd like to add more functionality to it, idk, for now it looks good
	return isLargeScreen() ? 70 : 70;
}

// insert dynamic manga items to container
function populateDynamicContainer(container, data) {
	const frag = popFrag = document.createDocumentFragment();
	data.forEach(function(item) {
		/*
			create element:
			<div>
				<img />
				<h2>One Punch Man</h2>
				<p>
					Chapter 170<br />
					<time datetime="TIMESTAMP">DATE</time>
				</p>
			</div>
		*/
		const a = el.mk("a"),
			div = el.mk("div", {
				class: "dynamic-item"
			}),
			h2 = el.mk("h2", {
				text: item.title
			}),
			childsArray = item.hasOwnProperty("time") ? [] : [],
			dateObj = new Date(item.date),
			p = el.mk("p", {
				childs: [
					"Chapter " + item.chapter + (item.end ? " END" : ""),
					el.mk("br"),
					el.mk("time", {
						text: formatDate(dateObj.toString().match(/[a-z]+ \d+/i)[0]),
						attrs: {
							datetime: dateObj.toJSON()
						}
					})
				]
			}),
			img = el.mk("img");
		img.src = item.img;
		div.appendChild(img);
		div.appendChild(h2);
		div.appendChild(p);
		a.href = item.url;
		a.appendChild(div);
		frag.appendChild(a);
	});
	container.appendChild(frag);
}

/* ================================ *\
    # implementations
\* ================================ */

/* generate menu links */
(function() {
	const menu = document.querySelector("#global-navigation ul"),
		frag = document.createDocumentFragment();
	// create links to all the [data-section] elements
	document.querySelectorAll("[data-section]").forEach(function(section) {
		let node = el.mk("li", {
			class: "global-navigation-menu-item",
			text: section.dataset.section,
			events: [
				["click", function() {
					// close overlay menu for mobile
					document.querySelector("#global-header").classList.remove("global-header-menu-open");
					// scroll to position
					scrollBy({
						// top position, minus the global nav height, minus 4px just because it looks nicer with a space between the section and header w/o using top padding
						top: section.getBoundingClientRect().top - getGlobalHeaderHeight() - 4,
						behavior: "smooth"
					});
				}]
			]
		});
		frag.appendChild(node);
	});
	menu.appendChild(frag);
	// change focused state marker based on document position
	updateNavFocusMarker();
	["hashchange", "scroll"].forEach(function(eventType) {
		addEventListener(eventType, function() {
			updateNavFocusMarker();
		});
	});
}());

/* add sections for recent/popular */
(function() {
	// gonna load it as json just to keep app.js a bit more tidy
	const xhr = new XMLHttpRequest();
	xhr.open("GET", "src/scripts/content.json", true);
	xhr.onload = function() {
		const data = JSON.parse(xhr.responseText);
		populateDynamicContainer(document.querySelector("#layout-site-recent .dynamic-container"), data.recent);
		populateDynamicContainer(document.querySelector("#layout-site-popular .dynamic-container"), data.popular);
		populateDynamicContainer(document.querySelector("#layout-site-featured .dynamic-container"), data.featured);
	}
	xhr.send();
}());

/* mobile toggle menu */
document.querySelector("#global-header svg").addEventListener("click", function(e) {
	// toggle menu state
	e.target.closest("header").classList.toggle("global-header-menu-open");
});

/* back to top button */
(function() {
	const btn = el.mk("div", {
			id: "back-to-top",
			events: [
				["click", function() {
					scrollTo({
						top: 0,
						behavior: "smooth"
					});
				}]
			]
		}),
		gn = document.querySelector("#global-navigation");
	function updateBtn() {
		const isBelowHeading = document.body.getBoundingClientRect().top <= getGlobalHeaderHeight();
		btn.classList.toggle("back-to-top-hidden", !isBelowHeading);
	}
	updateBtn();
	["hashchange", "scroll"].forEach(function(eventType) {
		document.addEventListener(eventType, updateBtn);
	});
	document.body.appendChild(btn);
}());

/* close mobile menu when switching to wider view (can happen when switching to landscape view) */
(function() {
	const header = document.querySelector("#global-header");
	addEventListener("resize", function() {
		if (isLargeScreen()) {
			header.classList.remove("global-header-menu-open");
		}
	});
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