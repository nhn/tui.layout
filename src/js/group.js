/**
 * @fileoverview layout group. group include item.
 * @author NHN Ent. FE dev Lab <dl_javascript@nhnent.com>
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var statics = require('./statics');
var Item = require('./item');

/**
 * The group class make list of item and group element(jQueryObject).
 * @class Group
 * @param {object} options - option
 *     @param {string} options.id
 *     @param {array} options.items array of items
 *     @param {string} [options.html] html of group element
 *     @param {(number|string)} [options.ratio] ratio
 * @ignore
 */
var Group = snippet.defineClass(/** @lends Group.prototype */ {
    /**
     * Element pool
     */
    $pool: $('<div class="pool" style="display:none"></div>'),

    init: function(options) {
        if (!options) {
            throw new Error(statics.ERROR.OPTIONS_NOT_DEFINED);
        }

        this.size = options.ratio + '%';
        this.id = options.id;

        this._makeElement(options.html || statics.HTML.GROUP);
        this._makeItems(options.items);
        this._appendDimmed();

        this.render();
    },

    /**
     * Make group element(JqueryObject)
     * @param {string} html The html string to create the html element
     * @private
     */
    _makeElement: function(html) {
        html = this._getHtml(html, {
            'group-id': this.id
        });

        this.$element = $(html);
        this.$element.css({
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
        this.$dimmed = $('<div class="' + statics.DIMMED_LAYER_CLASS + '"></div>');
        this.$dimmed.css({
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            display: 'none'
        });
    },
    /**
     * Append dimmed element
     * @private
     */
    _appendDimmed: function() {
        if (!this.$dimmed) {
            this._makeDimmed();
        }
        this.$element.append(this.$dimmed);
    },

    /**
     * Remove item by index
     * @param {number} index The index of the item to remove
     **/
    remove: function(index) {
        this.storePool(this.list[index]);
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
            this.$dimmed.before(item.$element);
            item.index = index;
            item.$element.attr({
                'data-index': index,
                'data-groupinfo': this.id
            });
        }, this);
        this.$dimmed.hide();
    },

    /**
     * Store items to pool
     * @param {object} $element A JQuery element to store in the pool
     */
    storePool: function($element) {
        if ($element) {
            this.$pool.append($element);
        } else {
            snippet.forEach(this.list, function(item) {
                this.$pool.append(item.$element);
            }, this);
        }
    }
});

module.exports = Group;
