'use strict';

var $ = require('jquery');

var Group = require('../src/js/group');

describe('group', function() {
    var group,
        group2,
        group3;

    beforeEach(function() {
        group = new Group({
            ratio: '5',
            items: [{
                id: 'item1',
                contentId: 'viewItem1',
                title: 'title1'
            }, {
                id: 'item2',
                contentId: 'viewItem2',
                title: 'title2'
            }, {
                id: 'item3',
                contentId: 'viewItem3',
                title: 'title3'
            }, {
                id: 'item4',
                contentId: 'viewItem3',
                title: 'title4'
            }],
            id: 'groupA'
        });
        group2 = new Group({
            ratio: '10',
            id: 'groupB'
        });
        group3 = new Group({
            ratio: '5',
            items: [{
                id: 'item5',
                contentId: 'viewItem5',
                title: 'title5'
            }, {
                id: 'item6',
                contentId: 'viewItem6',
                title: 'title6'
            }],
            id: 'groupA'
        });
    });

    it('group defined', function() {
        expect(group).toBeDefined();
        expect(group2).toBeDefined();
        expect(group3).toBeDefined();
    });

    it('group has list', function() {
        expect(group.list.length).toBe(4);
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

    it('storePool can store all element of group', function() {
        var item1 = group.list[0];
        expect($.contains(group.$element[0], item1.$element[0])).toBe(true);
        group.storePool();
        expect($.contains(group.$element[0], item1.$element[0])).toBe(false);
    });

    it('after move render group', function() {
        var item1 = group.list[0];
        group.remove(0);
        group2.add(item1);
        group.render();
        group2.render();
        expect($.contains(group2.$element[0], item1.$element[0])).toBe(true);
        expect($.contains(group.$element[0], item1.$element[0])).toBe(false);
    });

    it('group move to by index', function() {
        var item1 = group.list[2];
        group.remove(2);
        group3.add(item1, 1);
        expect(group.list.length).toBe(3);
        expect(group3.list.length).toBe(3);
        expect(group3.list[1]).toBe(item1);
        group.render();
        group3.render();
        expect($.contains(group3.$element[0], item1.$element[0])).toBe(true);
        expect($.contains(group.$element[0], item1.$element[0])).toBe(false);
        expect(item1.$element.attr('data-index')).toBe('1');
    });

    it('if item move to other group, item groupInfo changed', function() {
        var item = group.list[2];
        group.remove(2);
        group3.add(item, 1);
        expect(item.groupInfo).toBe(group3.id);
    });
});
