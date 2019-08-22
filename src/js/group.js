/**
 * @fileoverview layout group. group include item.
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var domUtil = require('tui-dom');
var util = require('./util');

var statics = require('./statics');
var Item = require('./item');

/**
 * The group class make list of item and group element.
 * @class Group
 * @param {HTMLElement} container container
 * @param {object} options - option
 *     @param {string} options.id
 *     @param {number|string} [options.ratio] ratio
 *     @param {array} options.items array of items
 *     @param {string} [options.html] html of group element
 * @ignore
 */
var Group = snippet.defineClass(/** @lends Group.prototype */ {
    init: function(container, options) {
        if (!options) {
            throw new Error(statics.ERROR.OPTIONS_NOT_DEFINED);
        }

        this.size = options.ratio + '%';
        this.id = options.id;

        this._makeElement(container, options.html || statics.HTML.GROUP);
        this._makeItems(options.items);
        this._makeDimmed();

        this.render();
    },

    /**
     * Make group element
     * @param {HTMLElement} container container
     * @param {string} html The html string to create the html element
     * @private
     */
    _makeElement: function(container, html) {
        html = this._getHtml(html, {
            'group-id': this.id
        });

        container.insertAdjacentHTML('beforeend', html);
        this.element = container.lastChild;
        domUtil.css(this.element, {
            'position': 'relative',
            'width': this.size
        });
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
    /* eslint-enable no-useless-escape */

    /**
     * Make list of item by items
     * @param {array} list The list of item's IDs
     * @private
     */
    _makeItems: function(list) {
        var options = {
            groupInfo: this.id
        };
        this.list = snippet.map(list, function(item) {
            snippet.extend(item, options);

            return new Item(item);
        }, this);
    },

    /**
     * Make dimmed element
     * @private
     */
    _makeDimmed: function() {
        this.element.insertAdjacentHTML('beforeend', '<div class="' + statics.DIMMED_LAYER_CLASS + '"></div>');
        this.dimmed = this.element.lastChild;
        domUtil.css(this.dimmed, {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            display: 'none'
        });
    },

    /**
     * Remove item by index
     * @param {number} index The index of the item to remove
     **/
    remove: function(index) {
        this.list.splice(index, 1);
    },

    /**
     * Add item to item list
     * @param {object} item item object
     * @param {number} [index] add The index of the item to add
     */
    add: function(item, index) {
        if (arguments.length > 1) {
            this.list.splice(index, 0, item);
        } else {
            this.list.push(item);
        }
        item.groupInfo = this.id;
    },

    /**
     * Rearrange group items
     */
    render: function() {
        snippet.forEach(this.list, function(item, index) {
            this.element.insertBefore(item.element, this.dimmed);
            item.index = index;
            item.element.setAttribute('data-index', index);
            item.element.setAttribute('data-groupinfo', this.id);
        }, this);
        util.hide(this.dimmed);
    }
});

module.exports = Group;
