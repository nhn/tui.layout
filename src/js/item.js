/**
 * @fileoverview layout item. contain original items.
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var domUtil = require('tui-dom');
var util = require('./util');

var statics = require('./statics');

var SELECTOR_GROUP = '.gp_';

/**
 * Item class is manage item state and title.
 * @class Item
 * @param {object} options
 *     @param {string} options.groupInfo group that has item name
 *     @param {string} options.contentId content element id
 *     @param {boolean} options.isClose content close or not
 *     @param {boolean} options.isDraggable drag helper element use or not
 *     @param {number} options.index index of content in group
 *     @param {string} [options.moveButtonHTML] move button HTML
 *     @param {string} [options.elementHTML] item element HTML
 *     @param {string} [options.titleHTML] item title element HTML
 * @ignore
 */
var Item = snippet.defineClass(/** @lends Item.prototype */ {
    /* eslint-disable complexity */
    init: function(options) {
        if (!options) {
            throw new Error(statics.ERROR.OPTIONS_NOT_DEFINED);
        }

        // html set
        snippet.extend(options, {
            elementHTML: options.elementHTML || statics.HTML.ELEMENT,
            moveButtonHTML: options.moveButtonHTML || statics.HTML.MOVEBUTTON,
            titleHTML: options.titleHTML || statics.HTML.TITLE,
            toggleButtonHTML: options.toggleButtonHTML || statics.HTML.TOGGLEBUTTON,
            title: options.title || statics.TEXT.DEFAULT_TITLE
        });
        snippet.extend(this, options);

        this._makeElement();

        // title used, and fix title (no hide)
        if (!snippet.isBoolean(this.isClose)) {
            this.fixTitle();
        }

        // close body(I don't like this code, are there any ways to fix it.)
        if (this.isClose) {
            this.close();
        } else {
            this.open();
        }

        this.content.appendChild(document.getElementById(this.contentId));
        this.element.setAttribute('id', 'item_id_' + this.contentId);
        this._setEvents();
    },
    /* eslint-enable complexity */

    /**
     * Get Index
     * @returns {number} Current index
     */
    getIndex: function() {
        return this.index;
    },

    /**
     * Make item root element
     * @private
     */
    _makeElement: function() {
        var wrapperClass = this.wrapperClass || statics.DEFAULT_WRPPER_CLASS,
            elementHTML = this._getHtml(this.elementHTML, {
                number: this.index,
                wrapper: wrapperClass
            });

        var group = document.querySelector(SELECTOR_GROUP + this.groupInfo);
        group.insertAdjacentHTML('beforeend', elementHTML);
        this.element = group.lastChild;
        domUtil.css(this.element, 'position', 'relative');
        this.content = this.element.querySelector('.' + wrapperClass);

        this.isDraggable = !!this.isDraggable;
        this._makeTitle();
    },

    /**
     * Make title element and elements belong to title
     * @private
     */
    _makeTitle: function() {
        this.element.insertAdjacentHTML('afterbegin', this.titleHTML);
        this.titleElement = this.element.firstChild;
        this.titleElement.innerHTML = this.title;

        if (this.isDraggable) {
            this._makeDragButton(this.moveButtonHTML);
        }

        this._makeToggleButton(this.toggleButtonHTML);
    },

    /* eslint-disable no-useless-escape */
    /**
     * Make markup with template
     * @param {string} html A item element html
     * @param {object} map The map to change html string
     * @returns {string}
     * @private
     */
    _getHtml: function(html, map) {
        html = html.replace(/\{\{([^\}]+)\}\}/g, function(mstr, name) {
            return map[name];
        });

        return html;
    },

    /**
     * Make drag button in title
     * @param {string} html button html
     * @private
     */
    _makeDragButton: function(html) {
        html = this._getHtml(html, {
            'item-id': 'item_id_' + this.contentId
        });
        this.titleElement.insertAdjacentHTML('beforeend', html);
    },

    /**
     * Make Toggle button in title
     * @param {string} toggleHTML - Toggled html contents
     * @private
     */
    _makeToggleButton: function(toggleHTML) {
        this.titleElement.insertAdjacentHTML('beforeend', toggleHTML);
        this.toggleButton = this.titleElement.lastChild;
    },

    /**
     * Close item element
     */
    close: function() {
        domUtil.addClass(this.toggleButton, 'open');
        util.hide(this.content);
    },

    /**
     * Open item element
     */
    open: function() {
        domUtil.removeClass(this.toggleButton, 'open');
        util.show(this.content);
    },

    /**
     * Fix title to do not hide. After fixTitle called, hideTitle do not work.
     */
    fixTitle: function() {
        this.showTitle();
        this.isTitleFix = true;
    },

    /**
     * Show title
     */
    showTitle: function() {
        util.show(this.titleElement);
    },

    /**
     * Hide title
     */
    hideTitle: function() {
        if (!this.isTitleFix) {
            util.hide(this.titleElement);
        }
    },

    /**
     * Toggle open/close
     */
    toggle: function() {
        if (domUtil.hasClass(this.toggleButton, 'open')) {
            this.open();
        } else {
            this.close();
        }
    },

    /**
     * Set all events about item
     * @private
     */
    _setEvents: function() {
        domUtil.on(this.toggleButton, 'click', this.toggle, this);
    }
});

module.exports = Item;
