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

// check if 2 items overlap along a given axis
function isIntersectingAlongAxis(a1, a2, b1, b2) {
	// a1 and a1 are the boundaries of 'item a', b1 and b2 are the boundaries of 'item b'
	// b2 needs to be > a1 [and] b1 needs to be < a2 to confirm intersection
	// works in cases of partial intersection, 'b' totally enclused in 'a' (b smaller along the axis) or 'b' totally engulfing 'a' (b larger along the axis)
	return b2 > a1 && b1 < a2;
}

// mark sections on screen
// used as argument just so there's no need to querySelectorAll each time- stored as variable in the scope of the function call
function highlightVisibleSections(sectionList) {
	const yStart = getGlobalHeaderHeight(); // don't want to highlight if someothing is only visible behind the top navigation bar
	sectionList.forEach(function(section) {
		const bbox = section.getBoundingClientRect(),
			// only need to check vertical axis since sections retain horizontal positioning
			isInView = isIntersectingAlongAxis(yStart, screen.availHeight, bbox.top, bbox.bottom);
		// toggle class, use returned boolean view to force-add/force-remove class
		section.classList.toggle("section-in-view", isInView);
	});
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

// show/hide the "back to top" button if the user scrolled down/back at the top of the page, respectively
function updateBtn(btn) {
	const isBelowHeading = document.body.getBoundingClientRect().top <= getGlobalHeaderHeight();
	btn.classList.toggle("back-to-top-hidden", !isBelowHeading);
}

/* ================================ *\
    # implementations
\* ================================ */

/* generate menu links */
/* also implement 'section-in-view' class to sections on screen */
(function() {
	const menu = document.querySelector("#global-navigation ul"),
		frag = document.createDocumentFragment(),
		sections = document.querySelectorAll("[data-section]");
	// create links to all the [data-section] elements
	sections.forEach(function(section) {
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
	highlightVisibleSections(sections);
	["hashchange", "scroll"].forEach(function(eventType) {
		addEventListener(eventType, function() {
			updateNavFocusMarker();
			highlightVisibleSections(sections);
		});
	});
}());

/* add sections for recent/popular */
(function() {
	// gonna load it as json just to keep app.js a bit more tidy
	const data = {
		"recent": [
			{
				"title": "Overgeared",
				"chapter": "143",
				"date": 1662012062622,
				"url": "/manga/104/chapters/143",
				"img": "src/images/overgeared.jpg"
			},
			{
				"title": "The King\u2019s Avatar",
				"chapter": "88",
				"date": 1661995819915,
				"url": "/manga/150/chapters/88",
				"img": "src/images/kingsavatar.jpg"
			},
			{
				"title": "Boy\u2019s Abyss",
				"chapter": "106",
				"date": 1662015260211,
				"url": "/manga/112/chapters/106",
				"img": "src/images/boysabyss.jpg"
			},
			{
				"title": "THE LAST HUMAN",
				"chapter": "474",
				"date": 1661993604810,
				"url": "/manga/96/chapters/474",
				"img": "src/images/lasthuman.jpg"
			},
			{
				"title": "Martial Peak",
				"chapter": "2555",
				"date": 1661994438625,
				"url": "/manga/199/chapters/2555",
				"img": "src/images/martialpeak.jpg"
			},
			{
				"title": "Gachi Akuta",
				"chapter": "26",
				"date": 1662011844394,
				"url": "/manga/178/chapters/26",
				"img": "src/images/gachi.jpg"
			}
		],
		"popular": [
			{
				"title": "One Punch Man",
				"chapter": "170",
				"date": 1661957001043,
				"url": "/manga/15/chapters/170",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Piece",
				"chapter": "1058",
				"date": 1661796823120,
				"url": "/manga/11/chapters/1058",
				"img": "src/images/onepiece.jpg"
			},
			{
				"title": "Omniscient Reader's Viewpoint",
				"chapter": "121",
				"date": 1661413507366,
				"url": "/manga/125/chapters/121",
				"img": "src/images/orvp.jpg"
			},
			{
				"title": "Arcane Sniper",
				"chapter": "85",
				"date": 1661417464788,
				"url": "/manga/700/chapters/85",
				"img": "src/images/arcanesniper.jpg"
			},
			{
				"title": "Leviathan",
				"chapter": "214",
				"date": 1661849036906,
				"url": "/manga/214/chapters/214",
				"img": "src/images/leviathan.jpg",
				"end": true
			},
			{
				"title": "Updater",
				"chapter": "91",
				"date": 1661505494088,
				"url": "/manga/314/chapters/91",
				"img": "src/images/updater.jpg"
			},
			{
				"title": "Mercenary Enrollment",
				"chapter": "98",
				"date": 1661787744853,
				"url": "/manga/158/chapters/98",
				"img": "src/images/mercenaryenrollment.jpg"
			},
			{
				"title": "Solo Login",
				"chapter": "147",
				"date": 1661886086369,
				"url": "/manga/185/chapters/147",
				"img": "src/images/solologin.jpg"
			},
			{
				"title": "Killing Stalking",
				"chapter": "67.5",
				"date": 1661632075920,
				"url": "/manga/35/chapters/67-5",
				"img": "src/images/killingstalking.jpg",
				"end": true
			},
			{
				"title": "Painter of the Night",
				"chapter": "102",
				"date": 1661839490422,
				"url": "/manga/95/chapters/102",
				"img": "src/images/painterofthenight.jpg"
			},
			{
				"title": "Pian Pian",
				"chapter": "82.1",
				"date": 1661658043208,
				"url": "/manga/82.1/chapters/82-1",
				"img": "src/images/pianpian.jpg"
			},
			{
				"title": "Nano Machine",
				"chapter": "120",
				"date": 1661487783606,
				"url": "/manga/103/chapters/120",
				"img": "src/images/nanomachine.jpg"
			}
		],
		"featured": [
			{
				"title": "One Punch Man",
				"chapter": "170",
				"date": 1661957001043,
				"url": "/manga/831/chapters/170",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "169",
				"date": 1661352201043,
				"url": "/manga/831/chapters/169",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "168",
				"date": 1660747401043,
				"url": "/manga/831/chapters/168",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "167",
				"date": 1660142601043,
				"url": "/manga/831/chapters/167",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "166",
				"date": 1659537801043,
				"url": "/manga/831/chapters/166",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "165",
				"date": 1658933001043,
				"url": "/manga/831/chapters/165",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "164",
				"date": 1658328201043,
				"url": "/manga/831/chapters/164",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "163.5",
				"date": 1657723401043,
				"url": "/manga/831/chapters/163-5",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "163",
				"date": 1657118601043,
				"url": "/manga/831/chapters/163",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "162",
				"date": 1656513801043,
				"url": "/manga/831/chapters/162",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "161",
				"date": 1655909001043,
				"url": "/manga/831/chapters/161",
				"img": "src/images/opm.jpg"
			},
			{
				"title": "One Punch Man",
				"chapter": "160",
				"date": 1655304201043,
				"url": "/manga/831/chapters/160",
				"img": "src/images/opm.jpg"
			}
		]
	};
	populateDynamicContainer(document.querySelector("#layout-site-recent .dynamic-container"), data.recent);
	populateDynamicContainer(document.querySelector("#layout-site-popular .dynamic-container"), data.popular);
	populateDynamicContainer(document.querySelector("#layout-site-featured .dynamic-container"), data.featured);
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
		});
	// update the button
	updateBtn(btn);
	// add scroll/hashchange listeners for updating the button
	["hashchange", "scroll"].forEach(function(eventType) {
		document.addEventListener(eventType, function() {
			updateBtn(btn);
		});
	});
	document.body.appendChild(btn);
}());

/* form submit */
document.querySelector("form").addEventListener("submit", function(e) {
	e.preventDefault();
	alert("Form has been successfully submitted!\n(for Udacity: close the alert, data logged in console)");
	const fD = new FormData(e.target),
		data = [];
	for (let [key, val] of fD) {
		data.push(`${key}: ${val}`);
	}
	console.log("\nform data:\n\n".padStart(64, "=") + data.join("\n") + "\n".padEnd(64, "="));
});

/* close mobile menu when switching to wider view (can happen when switching to landscape view) */
(function() {
	const header = document.querySelector("#global-header");
	addEventListener("resize", function() {
		if (isLargeScreen()) {
			header.classList.remove("global-header-menu-open");
		}
	});
}());