$(document).ready(function() {


	$(document).on('click', function(e) {
		var isHas = e.target.classList.contains('form__add');
		if( isHas ) return;

		if( $(e.target).hasClass("form__add") ) {
			alert(1)
		} else {

		}
		
	});

//end ready
});


