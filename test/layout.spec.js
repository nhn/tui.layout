'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var Layout = require('../src/js/layout');

describe('layout', function() {
    var layout1;
    var groupList1 = [{
        id: 'g0',
        ratio: '10',
        items: [{
            id: 'item-lifestyle',
            contentId: 'lifestyle',
            title: 'Sports',
            isDraggable: true
        },
        {
            id: 'item-game',
            contentId: 'game',
            title: 'Game',
            isDraggable: true
        }]
    }, {
        id: 'g1',
        ratio: '4',
        items: [{
            id: 'item-sports',
            contentId: 'sports',
            title: 'Life Style Seciton',
            isClose: false,
            isDraggable: true
        },
        {
            id: 'item-calendar', // 변경가능
            contentId: 'calendar',
            title: 'Calendar Seciton',
            isClose: false,
            isDraggable: true
        },
        {
            id: 'item-todolist', // 변경가능
            contentId: 'todolist',
            title: 'TodoList Seciton',
            isClose: false,
            isDraggable: true
        }]
    }, {
        id: 'g2',
        ratio: '6',
        items: [{
            id: 'item-weather', // 변경가능
            contentId: 'weather',
            title: 'Weather Seciton',
            isClose: false,
            isDraggable: true
        },
        {
            id: 'item-news', // 변경가능
            contentId: 'news',
            title: 'News Seciton',
            isClose: true,
            isDraggable: true
        }]
    }];

    jasmine.getFixtures().fixturesPath = 'base';
    jasmine.getStyleFixtures().fixturesPath = 'base';

    beforeEach(function() {
        loadFixtures('test/fixtures/layout.html');
        loadStyleFixtures('test/fixtures/layout.css');
    });

    beforeEach(function() {
        layout1 = new Layout($('#layout1'), {
            grouplist: groupList1
        });
    });

    it('define', function() {
        expect(layout1).toBeDefined();
    });

    it('create group and items', function() {
        var group1 = layout1.groups.g1;
        var list1 = group1.list;

        expect(group1).toBeDefined();
        expect(list1).toBeDefined();
    });

    it('getGroup with string', function() {
        var group = layout1._getGroup('g1');
        expect(group).toBe(layout1.groups.g1);
    });

    it('getGroup with element', function() {
        var origin = layout1.groups.g1;
        var group = layout1._getGroup('g1');
        var $groupEl = group.$element;
        var $itemEl = group.list[0].$element;
        expect(group).toBe(origin);
        expect(layout1._getGroup($groupEl)).toBe(origin);
        expect(layout1._getGroup($itemEl)).toBe(origin);
    });

    it('setGuide', function() {
        var group = layout1.groups.g1;
        var target = group.list[0].$element.find('.move-button')[0];
        var left, top;

        layout1._setGuide(target, 300, 100);
        left = parseInt(layout1._guide.$element.css('left'), 10);
        top = parseInt(layout1._guide.$element.css('top'), 10);
        expect(left).toBe(310);
        expect(top).toBe(110);
    });

    it('unlockTemp', function() {
        var $item = layout1.groups.g1.list[0].$element;
        var opacity;

        layout1.$temp = $item;
        layout1._lockTemp();
        opacity = parseFloat($item.css('opacity')).toFixed(1);
        expect(opacity).toBe('0.2');
        layout1._unlockTemp();
        opacity = parseFloat($item.css('opacity')).toFixed(1);
        expect(opacity).toBe('1.0');
    });

    it('_onMouseMove', function() {
        var $item = layout1.groups.g1.list[0].$element;
        var target = $item[0];
        var e = {
            target: target,
            clientX: 100,
            clientY: 50
        };
        var left, top;

        layout1.$temp = $item;

        layout1._onMouseMove(e);
        left = parseInt(layout1._guide.$element.css('left'), 10);
        top = parseInt(layout1._guide.$element.css('top'), 10);
        expect(left).toBe(110);
        expect(top).toBe(60);
    });

    xit('_detectMove', function(done) { // @todo isValid test?
        var group = layout1.groups.g0;
        var item = layout1.groups.g0.list[0];
        var pos = {
            x: 100,
            y: 250
        };
        var $target;

        $target = layout1._getTarget(item, pos, group);
        expect($target.way).toBe('before');
        setTimeout(function() {
            done();
        }, 1000);
    });
    describe('usageStatistics', function() {
        beforeEach(function() {
            spyOn(snippet, 'imagePing');
            this.layout = null;
        });

        it('should send hostname by default', function() {
            this.layout = new Layout($('#layout1'), {
                grouplist: groupList1
            });

            expect(snippet.imagePing).toHaveBeenCalled();
        });
        it('should not send hostname on usageStatistics option false', function() {
            this.layout = new Layout($('#layout1'), {
                grouplist: groupList1,
                usageStatistics: false
            });

            expect(snippet.imagePing).not.toHaveBeenCalled();
        });
    });
});
