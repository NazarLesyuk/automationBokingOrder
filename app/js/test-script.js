document.addEventListener("DOMContentLoaded", function(){

    /* ============================================================================== */
    
    // For TEST 
        // делегирование событий
        document.addEventListener('click', function(e) {
            var isHas = e.target.classList.contains('copyThisRows');
            if( isHas ) {
                var dom = document.querySelectorAll(".rowFields")[0];
                var test = dom.cloneNode(true);
                document.querySelector(".boxListCopyesFields").appendChild( test ); 
            }
        });
    
        let copyBtns = document.querySelectorAll(".copyThisRows");
        copyBtns.forEach(function(v,i,arr){
            copyBtns[i].addEventListener("click", function(){
                // console.log("click btn-cp")
            });
        });
    
    
    // RESPONSE FROM THE SERVER
    // Emaulate change form 
    // form 
    /* let form1 = document.querySelector("#formReservation");
    form1.addEventListener('DOMNodeInserted', function(){
        // console.log('form changed');
    }); */
    
    // btn
    let em = document.querySelector("#emulate");
    em.addEventListener('click', function(){
        let formIn = document.querySelectorAll("#formReservation .rowFields");
        formIn.forEach(function(v,i,arr){
            formIn[i].querySelector('.form-group').insertAdjacentHTML('afterbegin', `
            <div class="rel"><div class="errorM" id="wagon_number_3_error"><b></b>Вагон занят</div>
            </div>
            `);
        });
    });
    
    
    /* ============================================================================== */
});