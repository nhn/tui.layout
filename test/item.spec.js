var Item = require('../src/item');

describe('item set', function() {
	var item,
		item2,
		item3,
		item4;

	beforeEach(function() {
		item = new Item({
			title: 'title1',
			id: 'id1',
			contentId: 'lifeStyle',
			groupInfo: 'groupA',
			isDraggable: true,
			isClose: true,
			index: 0
		});
		item2 = new Item({
			id: 'iddddd1',
			contentId: 'lifeStyle',
			groupInfo: 'groupA',
			isDraggable: true,
			isClose: false,
			index: 1
		});
		item3 = new Item({
			id: 'id2',
			contentId: 'lifeStyle',
			groupInfo: 'groupA',
			isClose: false,
			index: 2
		});	
		item4 = new Item({
			title: 'asdf',
			id: 'id2',
			contentId: 'lifeStyle',
			groupInfo: 'groupA',
			index: 3
		});	
	});

	it('item defined', function() {
		expect(item).toBeDefined();
		expect(item.$element).toBeDefined();
	});

	it('item make title, if options include title and useDrag', function() {
		expect(item.$titleElement).toBeDefined();
		expect(item.$toggleButton).toBeDefined();
	});

	it('make option isOpen item, item display block', function() {
		expect(item.$content.css('display')).toBe('none');
		expect(item2.$content.css('display')).not.toBe('none');
	});

	it('toggle is working none -> block', function() {
		item.toggle();
		expect(item.$content.css('display')).not.toBe('none');
	});

	it('toggle is working(2) block -> none', function() {
		item2.toggle();
		expect(item2.$content.css('display')).toBe('none');
	});

	it('item4 title is fixed', function() {
		item4.hideTitle();
		// event run title Off still title is on
		expect(item4.$titleElement.css('display')).toBe('block');
	});

});	
