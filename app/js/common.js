$(document).ready(function() {


	$(document).on('click', function(e) {
		var isHas = e.target.classList.contains('form__add');
		// if( isHas ) return;

		if( $(e.target).hasClass("form__add") ) {
			// var parent = $(e.target).parent('.fieldset__cont').get(0);
			// $("#mainform").appendChild( $(".fieldset__cont")[0] );
			// $("#mainform").append( 'wtf' );
			var dom = document.querySelectorAll(".fieldset__cont")[0];
			console.log(dom);
			// document.getElementById("mainform").appendChild( dom ); 
			var test = dom.cloneNode(true);
			document.querySelector("#mainform").appendChild( test ); 
		} else {

		}
		
	});

//end ready
});


