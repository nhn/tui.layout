describe('layout', function() {
	var layout1,
		layout2,
		layout3,
		groupList1 = [
			{
				id: 'g1',
				ratio: '50%',
				items: [{
		            id : 'item-lifeStyle',
		            contentID: 'lifeStyle',
		            title: "Life Style Seciton",
		            isClose: false,
		            isDragable: true,
		            group: 'g1'
		        },
		        {
		            id : 'item-calendar', // 변경가능
		            contentID: 'calendar',
		            title: "Calendar Seciton",
		            isClose: false,
		            isDragable: true,
		            group: 'g1'
		        },
		        {
		            id : 'item-todoList', // 변경가능
		            contentID: 'todoList',
		            title: "TodoList Seciton",
		            isClose: false,
		            isDragable: true,
		            group: 'g1'
		        }]
			},
			{
				id: 'g2',
				ratio: '50%',
				items: [{
		            id : 'item-weather', // 변경가능
		            contentID: 'weather',
		            title: "Weather Seciton",
		            isClose: false,
		            isDragable: true
		        },
		        {
		            id : 'item-news', // 변경가능
		            contentID: 'news',
		            title: "News Seciton",
		            isClose: true,
		            isDragable: true
		        }]
			}
		],
		groupList2 = [
			{
				id: 'g1',
				ratio: '50%',
				items: [{
		            id : 'item-lifeStyle',
		            contentID: 'lifeStyle',
		            title: "Life Style Seciton",
		            isClose: false,
		            isDragable: true
		        }]
			},
			{
				id: 'g2',
				items: [{
		            id : 'item-lifeStyle',
		            contentID: 'lifeStyle',
		            title: "Life Style Seciton",
		            isClose: false,
		            isDragable: true
		        }]
			}
		];

	jasmine.getFixtures().fixturesPath = 'base';
	beforeEach(function() {
		loadFixtures('test/html/layout.html');
	});

	beforeEach(function() {
		layout1 = new ne.component.Layout({
			name: 'half',
		    grouplist: groupList1
		}, $('#layout1'));
		layout2 = new ne.component.Layout({
			name: 'half',
		    grouplist: groupList2
		}, $('#layout2'));
		layout3 = new ne.component.Layout({
			name: 'half',
		    grouplist: groupList2
		}, $('#layout3'));
	});

	it('define', function() {
		expect(layout1).toBeDefined();
		expect(layout2).toBeDefined();
		expect(layout3).toBeDefined();
	});

	it('create group and items', function() {
		var group1 = layout1.groups[0],
			group2 = layout2.groups[0],
			group3 = layout3.groups[0],
			item1 = layout1.groups[0].list[0],
			item2 = layout2.groups[0].list[0],
			item3 = layout3.groups[0].list[0];
		expect(group1).toBeDefined();
		expect(group2).toBeDefined();
		expect(group3).toBeDefined();
		expect(item1).toBeDefined();
		expect(item2).toBeDefined();
		expect(item3).toBeDefined();
	});

	it('create group elements', function() {
		var $group = layout1.groups[0].$element;
		expect($.contains(layout1.$element[0], $group[0])).toBe(true);
	});
});