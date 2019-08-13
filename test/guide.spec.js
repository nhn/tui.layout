'use strict';

var domUtil = require('tui-dom');

var Guide = require('../src/js/guide');

describe('view drag', function() {
    var drag = new Guide();

    jasmine.getFixtures().fixturesPath = 'base';

    beforeEach(function() {
        loadFixtures('test/fixtures/guide.html');
    });

    it('drag know range for insert', function() {
        drag.setPos({
            x: 100,
            y: 200
        });

        expect(drag.element.style.left).toBe('100px');
        expect(drag.element.style.top).toBe('200px');
    });

    it('set Content', function() {
        var content = document.createElement('div');
        domUtil.addClass(content, 'content');
        drag.setContent(content);
        expect(domUtil.hasClass(drag.element.firstChild, 'content')).toBe(true);
    });

    it('show with isDisable', function() {
        var status1, status2;
        drag.hide();
        drag.disable();
        drag.show();
        status1 = drag.element.style.display;
        drag.enable();
        drag.show();
        status2 = drag.element.style.display;
        expect(status1).toBe('none');
        expect(status2).not.toBe('none');
    });

    it('shadow move Element', function() {
        drag.moveTo({
            x: 100,
            y: 200
        });

        expect(drag.element.style.left).toBe('100px');
        expect(drag.element.style.top).toBe('200px');
    });
});
