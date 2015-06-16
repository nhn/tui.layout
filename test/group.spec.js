describe('group', function() {
	var group,
		group2;

	beforeEach(function() {
		group = new ne.component.Layout.Group({
			width: 300,
			items: [
				{
					id: 'item1',
					contentID : 'viewItem1',
					title: 'title1'
				},
				{
					id: 'item2',
					contentID : 'viewItem2',
					title: 'title2'
				},
				{
					id: 'item3',
					contentID : 'viewItem3',
					title: 'title3'
				},
				{
					id: 'item4',
					contentID : 'viewItem3',
					title: 'title4'
				}
			]
		});
		group2 = new ne.component.Layout.Group({
			width: 500
		});
		group3 = new ne.component.Layout.Group({
			width: 500,
			items: [
				{
					id: 'item5',
					contentID : 'viewItem5',
					title: 'title5'
				},
				{
					id: 'item6',
					contentID : 'viewItem6',
					title: 'title6'
				}
			]
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

	it('group move to', function() {
		var item1 = group.list[0];
		group.remove(0);
		group2.add(item1);
		expect(group2.list[0]).toBe(item1);
		expect(group.list[0]).not.toBe(item1);
	});

	it('group move to by index', function() {
		var item1 = group.list[2];
		group.remove(2);
		group3.add(item1, 1);
		expect(group.list.length).toBe(3);
		expect(group3.list.length).toBe(3);
		expect(group3.list[1]).toBe(item1);
	});

});
