'use strict';

/**
 * https://github.com/marrio-h/universal-parallax
 *
 * @version 1.3.3
 * @author Marius Hansen <marius.o.hansen@gmail.com>
 * @license MIT
 * @description Easy parallax plugin using pure javascript. Cross browser support, including mobile platforms. Based on goodparallax
 * @copyright © Marius Hansen 2019
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function( root, jQuery ) {
			if ( jQuery === undefined ) {
				// require('jQuery') returns a factory that requires window to
				// build a jQuery instance, we normalize how we use modules
				// that require this pattern but the window provided is a noop
				// if it's defined (how jquery works)
				if ( typeof window !== 'undefined' ) {
					jQuery = require('jquery');
				}
				else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var windowHeight = window.innerHeight,
		windowHeightExtra = 0;
	var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
		mobile = /Mobi/.test(navigator.userAgent);

	// check if safari - extend height
	if (safari && !mobile) {
		windowHeightExtra = window.outerHeight - window.innerHeight;
	}

	if (mobile) {
		windowHeight = window.screen.availHeight; // stops from jumping
		windowHeightExtra = (window.screen.availHeight - window.innerHeight) / 2; // prevents white spaces
	}

	// position parallax
	var positionParallax = function positionParallax(container, speed, parallax, elem) {
		var bgScroll = container.top / speed - windowHeightExtra;
		parallax[elem].style.top = bgScroll + 'px';
	};

	// animate parallax
	var animateParallax = function animateParallax(parallax, speed) {
		for (var i = 0; parallax.length > i; i++) {
			var container = parallax[i].parentElement.parentElement.getBoundingClientRect();

			// only animate if on screen
			if (container.top + container.height >= 0 && container.top <= windowHeight) {
				positionParallax(container, speed, parallax, i);
			}
		}
	};

	// determine height
	var calculateHeight = function calculateHeight(parallax, speed) {
		for (var i = 0; parallax.length > i; i++) {
			var container = parallax[i].parentElement.parentElement.getBoundingClientRect();
			var containerTop = parallax[i].parentElement.parentElement.offsetTop;
			var elemOffsetTop = (windowHeight - container.height) / 2;

			// set bgHeight & check if it needs to stretch beyond container bottom
			var bgHeight = windowHeight > container.height + containerTop ? container.height + containerTop - containerTop / speed : container.height + (elemOffsetTop - elemOffsetTop / speed) * 2;

			parallax[i].style.height = bgHeight + windowHeightExtra * 2 + 'px';
			positionParallax(container, speed, parallax, i);
		}
	};

	/**
	 * The jQuery Plugin for the universalParallax.
	 *
	 * @public
	 */
	$.fn.universalParallax = function universalParallax(param) {

		var up = function up(parallax, speed) {
			// check that speed is not a negative number
			if (speed < 1) {
				speed = 1;
			}

			// set height on elements
			calculateHeight(parallax, speed);

			// recalculate height on resize
			if (!mobile) {
				window.addEventListener('resize', function () {
					windowHeight = window.innerHeight;
					calculateHeight(parallax, speed);
				});
			}

			// Add scroll event listener
			window.addEventListener('scroll', function () {
				animateParallax(parallax, speed);
			});
		};

		// This is the easiest way to have default param.
		var param = $.extend({
			// These are the defaults.
			speed: 1.5
		}, param );


		var parallaxs = this;

		this.each(function() {
			var parallax = this;
			// make container div
			var wrapper = document.createElement('div');
			this.parentNode.insertBefore(wrapper, parallax);
			wrapper.appendChild(parallax);
			var parallaxContainer = parallax.parentElement;
			parallaxContainer.className += 'parallax__container';

			// parent elem need position: relative for effect to work - if not already defined, add it
			if (window.getComputedStyle(parallaxContainer.parentElement, null).getPropertyValue('position') !== 'relative') {
				parallaxContainer.parentElement.style.position = 'relative';
			}

			var imgData = parallax.dataset.parallaxImage;
			// add image to div if none is specified
			if (typeof imgData !== 'undefined') {
				parallax.style.backgroundImage = 'url(' + imgData + ')';
				// if no other class than .parallax is specified, add CSS
				if (parallax.classList.length === 1 && parallax.classList[0] === 'parallax') {
					parallax.style.backgroundRepeat = 'no-repeat';
					parallax.style.backgroundPosition = 'center';
					parallax.style.backgroundSize = 'cover';
				}
			}
		});

		// when page is loaded && init completed -> run function
		document.addEventListener('readystatechange', function (event) {
			if (event.target.readyState === 'complete') {
				up(parallaxs, param.speed);
			}
		});
	};

}));