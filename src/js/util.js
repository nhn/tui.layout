/**
 * @fileoverview Utils for the layout
 * @author NHN. FE dev Lab. <dl_javascript@nhn.com>
 */

'use strict';

var domUtil = require('tui-dom');

var utils = {
    /**
     * Show an element
     * @param {HTMLElement} element An element
     */
    show: function(element) {
        domUtil.css(element, 'display', 'block');
    },

    /**
     * Hide an element
     * @param {HTMLElement} element An element
     */
    hide: function(element) {
        domUtil.css(element, 'display', 'none');
    }
};

module.exports = utils;
