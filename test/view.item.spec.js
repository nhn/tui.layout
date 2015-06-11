describe('weget.view.item', function() {
	var item,
		itemview,
		Item = weget.Vision.Item,
		view = weget.Vision.View;

	beforeEach(function() {
		item = new Item({
			width: 300,
			group: 'top',
			title: 'item title',
			type : 'typeA',
			index: 1,
			grpIndex: 1
		});
		itemview = new view.Item({
			vm: item
		});
	});

	it('itemview has item', function() {
		expect(itemview._vm).toBe(item);
	});

	it('itemview has element', function() {
		expect(itemview._element).toBeDefined();
		expect(itemview._element.nodeType).toBe(1);
	});

	it('itemveiw element has group and index', function() {
		var group = itemview._element.getAttribute('grp-name'),
			grpIndex = parseInt(itemview._element.getAttribute('item-index'), 10);
		expect(group).toBe('top');
		expect(grpIndex).toBe(1);
	});

	it('vm notify', function() {
		item.set('group', 'left');
		var group = itemview._element.getAttribute('grp-name');
		expect(group).toBe('left');
	});
});