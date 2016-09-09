function throttle(fn, threshold, scope) {
	threshold || (threshold = 250);
	var last,
	deferTimer;
	return function () {
		var context = scope || this;

		var now = +new Date,
		args = arguments;
		if (last && now < last + threshold) {
			clearTimeout(deferTimer);
			deferTimer = setTimeout(function () {
				last = now;
				fn.apply(context, args);
			}, threshold);
		} else {
			last = now;
			fn.apply(context, args);
		}
	};
}

function debounce(fn, delay) {
	var timer = null;
	return function () {
		var context = this, args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			fn.apply(context, args);
		}, delay);
	};
}

var ge = (function(){

	var map = new Map();

	return function( id ) {
		var el = map.get( id );
		if( el ) {
		} else {
			el = document.getElementById( id );
			map.set( id, el );
		}
		return el;
	}

})();
