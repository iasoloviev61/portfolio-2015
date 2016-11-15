var myModule = (function () {
	
	var init = function () {
		_setUpListners();
	};
	var _setUpListners = function () {
		console.log('Прослушка событий');
	}
	return {
		init: init 
	};

})();

myModule.init();

