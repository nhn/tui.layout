var Guide = require('../src/guide');

describe('view drag', function() {
	var drag = new Guide();
	jasmine.getFixtures().fixturesPath = 'base';
	beforeEach(function() {
		loadFixtures('test/html/guide.html');
	});

	it('drag know range for insert', function() {
		drag.setPos({
			x: 100,
			y: 200
		});

		expect(drag.$element.css('left')).toBe('100px');
		expect(drag.$element.css('top')).toBe('200px');
	});
	it('set Content', function() {
		var $content = $('<div class="content"></div>');
		drag.setContent($content);
		expect(drag.$element.children().first().hasClass('content')).toBe(true);
	});
	it('show with isDisable', function() {
		var status1, status2;
		drag.hide();
		drag.disable();
		drag.show();
		status1 = drag.$element[0].style.display;
		drag.enable();
		drag.show();
		status2 = drag.$element[0].style.display;
		expect(status1).toBe('none');
		expect(status2).not.toBe('none');
	});
	it('shadow move Element', function() {
		drag.moveTo({
			x: 100,
			y: 200
		});

		expect(drag.$element.css('left')).toBe('100px');
		expect(drag.$element.css('top')).toBe('200px');
	});
});
