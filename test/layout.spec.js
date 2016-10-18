tui.util.defineNamespace('tui.component');
tui.component.Layout = require('../src/layout');

describe('layout', function() {
	var layout1,
		groupList1 = [
			{
				id: 'g0',
				ratio: '10',
				items: [{
					id : 'item-lifeStyle',
					contentId: 'lifeStyle',
					title: "Sports",
					isDraggable: true
				},
					{
						id : 'item-game',
						contentId: 'game',
						title: "Game",
						isDraggable: true
					}]
			},
			{
				id: 'g1',
				ratio: '4',
				items: [{
					id : 'item-sports',
					contentId: 'sports',
					title: "Life Style Seciton",
					isClose: false,
					isDraggable: true
				},
					{
						id : 'item-calendar', // 변경가능
						contentId: 'calendar',
						title: "Calendar Seciton",
						isClose: false,
						isDraggable: true
					},
					{
						id : 'item-todoList', // 변경가능
						contentId: 'todoList',
						title: "TodoList Seciton",
						isClose: false,
						isDraggable: true
					}]
			},
			{
				id: 'g2',
				ratio: '6',
				items: [{
					id : 'item-weather', // 변경가능
					contentId: 'weather',
					title: "Weather Seciton",
					isClose: false,
					isDraggable: true
				},
					{
						id : 'item-news', // 변경가능
						contentId: 'news',
						title: "News Seciton",
						isClose: true,
						isDraggable: true
					}]
			}
		];

	jasmine.getFixtures().fixturesPath = 'base';
	jasmine.getStyleFixtures().fixturesPath = 'base';
		beforeEach(function() {
		loadFixtures('test/html/layout.html');
		loadStyleFixtures('test/css/layout.css');
	});

	beforeEach(function() {
		layout1 = new tui.component.Layout({
		    grouplist: groupList1
		}, $('#layout1'));
	});

	it('define', function() {
		expect(layout1).toBeDefined();
	});

	it('create group and items', function() {
		var group1 = layout1.groups['g1'],
			list1 = group1.list;

		expect(group1).toBeDefined();
		expect(list1).toBeDefined();

	});

	it('getGroup with string', function() {
		var group = layout1._getGroup('g1');
		expect(group).toBe(layout1.groups['g1']);
	});

	it('getGroup with element', function() {
		var origin = layout1.groups['g1'],
			group = layout1._getGroup('g1'),
			$groupEl = group.$element,
			$itemEl = group.list[0].$element;
		expect(group).toBe(origin);
		expect(layout1._getGroup($groupEl)).toBe(origin);
		expect(layout1._getGroup($itemEl)).toBe(origin);
	});

	it('setGuide', function() {
		var group = layout1.groups['g1'],
			target = group.list[0].$element.find('.move-button')[0],
			left,
			top;

		layout1._setGuide(target, 300, 100);
		left = parseInt(layout1._guide.$element.css('left'), 10);
		top = parseInt(layout1._guide.$element.css('top'), 10);
		expect(left).toBe(310);
		expect(top).toBe(110);
	});

	it('unlockTemp', function() {
		var $item = layout1.groups['g1'].list[0].$element,
			opacity;
		layout1.$temp = $item;
		layout1._lockTemp();
		opacity = parseFloat($item.css('opacity')).toFixed(1);
		expect(opacity).toBe('0.2');
		layout1._unlockTemp();
		opacity = parseFloat($item.css('opacity')).toFixed(1);
		expect(opacity).toBe('1.0');
	});

	it('_onMouseMove', function() {
		var $item = layout1.groups['g1'].list[0].$element,
			target = $item[0],
			e = {target: target, clientX: 100, clientY: 50},
			left,
			top;

		layout1.$temp = $item;

		layout1._onMouseMove(e);
		left = parseInt(layout1._guide.$element.css('left'), 10);
		top = parseInt(layout1._guide.$element.css('top'), 10);
		expect(left).toBe(110);
		expect(top).toBe(60);
	});

	it('_detectMove', function(done) {
		var group = layout1.groups['g0'],
			item = layout1.groups['g0'].list[0],
			pos = {
				x: 100,
				y: 40
			},
			$target;

		$target = layout1._getTarget(item, pos, group);
		//expect($target.way).toBe('before');
		setTimeout(function() {
			done();
		}, 1000)
	});
});
