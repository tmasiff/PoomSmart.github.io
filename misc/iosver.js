const VERSION_CHECK_SUPPORTED = "Your iOS version is supported! &#x1f60a;";
const VERSION_CHECK_NEEDS_UPGRADE = "Requires at least iOS %s &#x1f615;";
const VERSION_CHECK_UNCONFIRMED = "Not yet tested on iOS %s &#x1f601;";
const VERSION_CHECK_UNSUPPORTED = "Only compatible with iOS %s to %s";

(function(document) {
	"use strict";

	function parseVersionString(version) {
		var bits = version.split(".");
		return [ bits[0], bits[1] ? bits[1] : 0, bits[2] ? bits[2] : 0 ];
	}

	function compareVersions(v1, v2, options) {
		var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

		function isValidPart(x) {
			return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
		}

		if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
			return NaN;
		}

		if (zeroExtend) {
			while (v1parts.length < v2parts.length) v1parts.push("0");
			while (v2parts.length < v1parts.length) v2parts.push("0");
		}

		if (!lexicographical) {
			v1parts = v1parts.map(Number);
			v2parts = v2parts.map(Number);
		}

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length == i) {
				return 1;
			}

			if (v1parts[i] == v2parts[i]) {
				continue;
			}
			else if (v1parts[i] > v2parts[i]) {
				return 1;
			}
			else {
				return -1;
			}
		}

		if (v1parts.length != v2parts.length) {
			return -1;
		}

		return 0;
	}

	var prerequisite = document.querySelector(".prerequisite"),
		version = navigator.appVersion.match(/CPU( iPhone)? OS (\d+)_(\d+)(_(\d+))? like/i);

	if (!prerequisite || !version) {
		return;
	}

	var osVersion = [ version[2], version[3], version[4] ? version[5] : 0 ],

		osString = osVersion[0] + "." + osVersion[1] + (osVersion[2] && osVersion[2] != 0 ? "." + osVersion[2] : ""),
		minString = prerequisite.dataset.minIos,
		maxString = prerequisite.dataset.maxIos,

		minVersion = parseVersionString(minString),
		maxVersion = maxString ? parseVersionString(maxString) : null,

		message = VERSION_CHECK_SUPPORTED,
		isBad = false;

	if (compareVersions(minVersion, osVersion) == 1) {
		message = VERSION_CHECK_NEEDS_UPGRADE.replace("%s", minString);
		isBad = true;
	} else if (maxVersion && compareVersions(maxVersion, osVersion) == -1) {
		if ("unsupported" in prerequisite.dataset) {
			message = VERSION_CHECK_UNSUPPORTED.replace("%s", minString).replace("%s", maxString);
		} else {
			message = VERSION_CHECK_UNCONFIRMED.replace("%s", osString);
		}

		isBad = true;
	}

//	prerequisite.querySelector("p").textContent = message;
    prerequisite.querySelector("p").innerHTML = message;

	if (isBad) {
		prerequisite.classList.add("info");
	}
})(document);