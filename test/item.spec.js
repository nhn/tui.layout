'use strict';

var Item = require('../src/js/item');

describe('item set', function() {
    var item, item2, item3;

    jasmine.getFixtures().fixturesPath = 'base';

    beforeEach(function() {
        loadFixtures('test/fixtures/item.html');

        item = new Item({
            title: 'title1',
            id: 'id1',
            contentId: 'lifestyle',
            groupInfo: 'groupA',
            isDraggable: true,
            isClose: true,
            index: 0
        });
        item2 = new Item({
            id: 'iddddd1',
            contentId: 'lifestyle',
            groupInfo: 'groupA',
            isDraggable: true,
            isClose: false,
            index: 1
        });
        item3 = new Item({
            title: 'asdf',
            id: 'id2',
            contentId: 'lifestyle',
            groupInfo: 'groupA',
            index: 3
        });
    });

    it('item defined', function() {
        expect(item).toBeDefined();
        expect(item.element).toBeDefined();
    });

    it('item make title, if options include title and useDrag', function() {
        expect(item.titleElement).toBeDefined();
        expect(item.toggleButton).toBeDefined();
    });

    it('make option isOpen item, item display block', function() {
        expect(item.content.style.display).toBe('none');
        expect(item2.content.style.display).not.toBe('none');
    });

    it('toggle is working none -> block', function() {
        item.toggle();
        expect(item.content.style.display).not.toBe('none');
    });

    it('toggle is working(2) block -> none', function() {
        item2.toggle();
        expect(item2.content.style.display).toBe('none');
    });

    it('item3 title is fixed', function() {
        item3.hideTitle();
        // event run title Off still title is on
        expect(item3.titleElement.style.display).toBe('block');
    });
});
