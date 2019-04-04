/**
 * @fileoverview The static values
 * @author NHN. FE dev team.<dl_javascript@nhn.com>
 */

'use strict';

module.exports = {
    HTML: {
        MOVEBUTTON: '<button class="move-button drag-item-move" data-item="{{item-id}}">move</button>',
        ELEMENT: '<div class="item" data-index="{{number}}"><div class="{{wrapper}}"></div></div>',
        TITLE: '<div class="title"></div>',
        TOGGLEBUTTON: '<button class="toggle-button">toggle</button>',
        GROUP: '<div class="group gp_{{group-id}}" data-group="{{group-id}}"></div>',
        GUIDE: '<div class="item-guide"></div>'
    },
    TEXT: {
        DEFAULT_TITLE: 'no title'
    },
    ERROR: {
        OPTIONS_NOT_DEFINED: 'options are not defined'
    },
    DEFAULT_WRPPER_CLASS: 'item-body',
    DIMMED_LAYER_CLASS: 'dimmed-layer'
};
