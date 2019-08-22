/**
 * @fileoverview Utils for tests
 * @author NHN. FE dev Lab. <dl_javascript@nhn.com>
 */

'use strict';

var utils = {
    /**
     * Check whether a DOM element contains another DOM element.
     * @param {HTMLElement} container Container element
     * @param {HTMLElement} elem Contained element
     * @returns {boolean}
     */
    contains: function(container, elem) {
        var result = false;

        while (elem) {
            if (elem === container) {
                result = true;
                break;
            }
            elem = elem.parentElement;
        }

        return result;
    }
};

module.exports = utils;
