$(document).ready(function() {


	$(document).on('click', function(e) {
		var isHas = e.target.classList.contains('form__add');
		console.log(this)
		console.log(e)
		console.log(isHas)

		if( $(this).hasClass("form__add") ) {
			alert(1)
		}
	});

//end ready
});


