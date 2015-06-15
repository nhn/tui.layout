// describe('group', function() {
// 	var group;

// 	beforeEach(function() {
// 		group = new ne.component.Layout.Group();
// 	});

// 	it('group is defined and has list', function() {
// 		expect(group).toBeDefined();
// 	});

// 	it('group item add first', function() {
// 		var item1 = new ne.component.Layout.Item({
// 			width:300,
// 			group:'top',
// 			title:'asdf',
// 			type: 'type'
// 		});
// 		var item2 = new ne.component.Layout.Item({
// 			width:300,
// 			group:'top',
// 			title:'asdf',
// 			type: 'type'
// 		});
// 		group.add(item1);
// 		expect(group.first).toBe(item1);
// 	});

// 	it('group item add next to first item', function() {
// 		var item1 = new ne.component.Layout.Item({
// 			width:300,
// 			group:'top',
// 			title:'asdf',
// 			type: 'type'
// 		});
// 		var item2 = new ne.component.Layout.Item({
// 			width:300,
// 			group:'top',
// 			title:'asdf',
// 			type: 'type'
// 		});
// 		group.add(item1);
// 		group.add(item2);
// 		expect(group.first.getNext()).toBe(item2);
// 	});

// 	it('group item add with target', function() {
// 		var i = 0, item = [];
// 		for (; i < 10; i++) {
// 			item.push(new ne.component.Layout.Item({
// 				width:300,
// 				group:'top',
// 				title:'asdf' + i,
// 				type: 'type'
// 			}));
// 		}

// 		group.add(item[0]);
// 		group.add(item[1]);
// 		group.add(item[1], item[2], true);

// //		expect(group.getTarget(1)).toBe(item[2]);
// 	});

// 	it('getTarget', function() {
// 		var i = 0, item = [];
// 		for (; i < 10; i++) {
// 			item.push(new ne.component.Layout.Item({
// 				width:300,
// 				group:'top',
// 				title:'asdf' + i,
// 				type: 'type'
// 			}));
// 			group.add(item[i]);
// 		}
// 		expect(group.getTarget(2)).toBe(item[2]);
// 	});

// 	it('remove', function() {
// 		var i = 0, item = [];
// 		for (; i < 10; i++) {
// 			item.push(new ne.component.Layout.Item({
// 				width:300,
// 				group:'top',
// 				title:'asdf' + i,
// 				type: 'type'
// 			}));
// 			group.add(item[i]);
// 		}
// 		group.remove(3);
// 		expect(group.getTarget(3)).toBe(item[4]);
// 	});

// });