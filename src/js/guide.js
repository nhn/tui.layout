/**
 * @fileoverview Layout helper object. Guide mouse move-statement to know what is dragged well.
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var domUtil = require('tui-dom');
var util = require('./util');

var statics = require('./statics');
/**
 * Guide class make helper element and move helper element by position.
 * @classGuide
 * @param {object} [options]
 *     @param {string} [options.guideHTML] guide The html will be guide element.
 * @ignore
 */
var Guide = snippet.defineClass(/** @lends Guide.prototype */ {
    init: function(options) {
        options = options || {};

        document.body.insertAdjacentHTML('beforeend', options.guideHTML || statics.HTML.GUIDE);
        this.element = document.body.lastChild;
        domUtil.css(this.element, 'position', 'absolute');

        this.dimElements = document.querySelectorAll('.' + statics.DIMMED_LAYER_CLASS);

        this.hide();
    },

    /**
     * Show each dimmed layer
     * @param {object} pos The position to initialize guide element
     * @param {HTMLElement} element The helper element
     **/
    ready: function(pos, element) {
        this.setPos(pos);

        snippet.forEachArray(this.dimElements, function(dimElement) {
            util.show(dimElement);
        });

        if (element) {
            this.setContent(element);
        }

        this.show();
    },

    /**
     * Hide each dimmed layer
     **/
    finish: function() {
        snippet.forEachArray(this.dimElements, function(dimElement) {
            util.hide(dimElement);
        });
        this.hide();
    },

    /**
     * Move to position
     * @param {object} pos The position to move
     */
    moveTo: function(pos) {
        this.setPos(pos);
    },

    /**
     * Set Pos for move
     * @param {object} pos  The position to move
     */
    setPos: function(pos) {
        domUtil.css(this.element, {
            left: pos.x + 'px',
            top: pos.y + 'px'
        });
    },

    /**
     * Set guide content
     * @param {string} content The content object to copy and append to guide element.
     */
    setContent: function(content) {
        snippet.forEachArray(this.element.children, function(child) {
            domUtil.removeElement(child);
        });
        this.element.appendChild(content.cloneNode(true));
        domUtil.css(this.element, {
            width: content.offsetWidth + 'px',
            height: content.offsetHeight + 'px'
        });
    },

    /**
     * Show element
     */
    show: function() {
        if (!this.isDisable) {
            util.show(this.element);
        }
    },

    /**
     * Hide element
     */
    hide: function() {
        util.hide(this.element);
    },

    /**
     * Disable guide
     */
    disable: function() {
        this.isDisable = true;
    },

    /**
     * Enable guide
     */
    enable: function() {
        this.isDisable = false;
    },

    /**
     * Set move target
     * @param {object} el The element is moving in layout.
     */
    setMoveElement: function(el) {
        this.moveElement = el;
    }
});

module.exports = Guide;
