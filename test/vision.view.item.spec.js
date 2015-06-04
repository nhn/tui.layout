describe('weget.view.item', function() {
	var item,
		itemview,
		Item = weget.Vision.Item,
		view = weget.Vision.View;

	beforeEach(function() {
		item = new Item({
			width: 300,
			group: 'top',
			title: 'vision title',
			type : 'typeA',
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
	});

	it('itemveiw element has group and index', function() {
		var group = itemview._element.getAttribute('group'),
			grpIndex = parseInt(itemview._element.getAttribute('group-index'), 10);
		expect(group).toBe('top');
		expect(grpIndex).toBe(1);
	});
});