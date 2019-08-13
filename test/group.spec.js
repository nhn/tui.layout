'use strict';

var Group = require('../src/js/group');

describe('group', function() {
    var group,
        group2,
        group3;

    var contains = function(container, contained) {
        var result = false;
        var parent = contained.parentElement;

        while (parent) {
            if (parent === container) {
                result = true;
                break;
            }
            parent = parent.parentElement;
        }

        return result;
    };

    jasmine.getFixtures().fixturesPath = 'base';
    jasmine.getStyleFixtures().fixturesPath = 'base';

    beforeEach(function() {
        var layout;

        loadFixtures('test/fixtures/layout.html');
        layout = document.querySelector('#layout1');

        group = new Group(layout, {
            id: 'g0',
            ratio: '4',
            items: [{
                id: 'item-sports',
                contentId: 'sports',
                title: 'Life Style Seciton',
                isClose: false,
                isDraggable: true
            },
            {
                id: 'item-calendar',
                contentId: 'calendar',
                title: 'Calendar Seciton',
                isClose: false,
                isDraggable: true
            },
            {
                id: 'item-todolist',
                contentId: 'todoList',
                title: 'TodoList Seciton',
                isClose: false,
                isDraggable: true
            }]
        });

        group2 = new Group(layout, {
            id: 'g1',
            ratio: '10'
        });

        group3 = new Group(layout, {
            id: 'g2',
            ratio: '6',
            items: [{
                id: 'item-weather',
                contentId: 'weather',
                title: 'Weather Seciton',
                isClose: false,
                isDraggable: true
            },
            {
                id: 'item-news',
                contentId: 'news',
                title: 'News Seciton',
                isClose: true,
                isDraggable: true
            }]
        });
    });

    it('group defined', function() {
        expect(group).toBeDefined();
        expect(group2).toBeDefined();
        expect(group3).toBeDefined();
    });

    it('group has list', function() {
        expect(group.list.length).toBe(3);
        expect(group2.list.length).toBe(0);
        expect(group3.list.length).toBe(2);
    });

    it('item has right group name', function() {
        expect(group.list[0].groupInfo).toBe(group.id);
    });

    it('group move to', function() {
        var item1 = group.list[0];
        group.remove(0);
        group2.add(item1);
        expect(group2.list[0]).toBe(item1);
        expect(group.list[0]).not.toBe(item1);
    });

    it('after move render group', function() {
        var item1 = group.list[0];
        group.remove(0);
        group2.add(item1);
        group.render();
        group2.render();
        expect(contains(group2.element, item1.element)).toBe(true);
        expect(contains(group.element, item1.element)).toBe(false);
    });

    it('group move to by index', function() {
        var item1 = group.list[2];
        group.remove(2);
        group3.add(item1, 1);
        expect(group.list.length).toBe(2);
        expect(group3.list.length).toBe(3);
        expect(group3.list[1]).toBe(item1);
        group.render();
        group3.render();
        expect(contains(group3.element, item1.element)).toBe(true);
        expect(contains(group.element, item1.element)).toBe(false);
        expect(item1.element.getAttribute('data-index')).toBe('1');
    });

    it('if item move to other group, item groupInfo changed', function() {
        var item = group.list[2];
        group.remove(2);
        group3.add(item, 1);
        expect(item.groupInfo).toBe(group3.id);
    });
});
