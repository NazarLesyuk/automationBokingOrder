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
	document.querySelector("#btn_reserv").addEventListener("click", function(){
		// console.log("click btn_reserv")
	});

/*
// RESPONSE FROM THE SERVER
// Emaulate change form 
// form 
let form1 = document.querySelector("#formReservation");
form1.addEventListener('DOMNodeInserted', function(){
	// console.log('form changed');
});

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
*/

/* ============================================================================== */



// SCRIPT
/* 
Steps:
[+] 1. Запитати чи запустити программу
[+] 2. робота з файлом
		2.1. загрузити файл
		2.2. парсити *.CSV файл
[+] 3. заповнити рядки
		3.1. нажати на кнопку "Добавити рядок"
		3.2. заповнити перший ряд
		3.3. заповнити всі інші рядки
	4. Нажати кнопку "Забронировать"
	5. Перевірити чи немає ніде помилки про заняйтий вагон
		5.1. Якщо є - на полі де помилка навести фокус
		5.2. Якщо немає - відслідкувати появлення попапвікна
	6. Панель управління
*/

// Variables
	const MAIN = {
		isBooked: false
	};

// Functions:
	// 2.1
	function selectFile(e) {
		// Check for the various File API support.
		if ( window.File && window.FileReader && window.FileList && window.Blob) {
			let file = e.target.files; // FileList object
			file = file[0];
			let result;
	
			console.log(file);
			console.log(typeof file.type);
			// check 
			if (file.name.indexOf('csv') === -1) {
				alert(" Не вірний формат файлу, допускається - CSV");
				document.getElementById("TPS_STATUS").innerHTML = 'failed';
				return false
			}
	
			// read file - async
			const reader = new FileReader();
			reader.readAsText(file);
			// console.log(reader.readyState); // 1 - loading 
	
			reader.onload = function(){
				// console.log(reader.readyState); // 2 - done
				console.log(reader.result)
				result = reader.result;
				MAIN.data = result;
				
				setStatus("ready");
				return result;
			}
		} else {
			console.log('The File APIs are not fully supported in this browser.');
		}
	}
	function setStatus(stat){
		document.getElementById("TPS_STATUS").innerHTML = stat;
	}
	// 2.2
	function parseCSV(data){
		let clrArr = [];
		let arr = data.toString().split('\n');
		// console.log(arr)

		for(let i = 1; i < arr.length-1; i++) {
			let item = arr[i];
			item = item.split(';');

			for (let j = 0; j <= item.length-1; j++ ) {
				// console.log(item[j])
				if( j === 1 || j === 3 || j === 5) {
					let someItem = item[j];
					someItem = someItem.substr(1, someItem.length - 3)
					someItem = someItem.replace('""', '"')
					// console.log("test " + someItem)
					item[j] = someItem
					// console.log("test " +  item[j])
				}
				if( j === 6 ) {
					item[j] = item[j].replace('\r', '')
				}
			}
			clrArr.push(item)
		}
		clrArr.shift(); // delete titles

		return clrArr
	}
	// 3.1
	function cloneRow(arr) {
		const cpBtn = document.querySelector(".copyThisRows");
		let count = arr.length - 1; // minus 1 becouse we don't need a first row in arr
		while(count){
			cpBtn.click();
			count--;
		}
	}
	// 3.2
	function fillFirstRow(selector, arr) {
		let row = document.querySelector(selector);
		const inputs = [
			'input[name*=wagon_number]',
			'input[name*=consignee]',
			'input[name*=code_recipient]',
			'input[name*=cargo_owner]',
			'input[name*=code_owner]',
			'input[name*=forwarder]',
			'input[name*=station]'
		];
	
		inputs.forEach(function(value, i, inputs) {
			row.querySelector(value).value = arr[i];
		});
	
		return true
	}
	// 3.3
	function fillRows(selector, arr){
		let row = document.querySelectorAll(selector);
		arr.shift();
		const inputs = [
			'input[name*=wagon_number]',
			'input[name*=consignee]',
			'input[name*=code_recipient]',
			'input[name*=cargo_owner]',
			'input[name*=code_owner]',
			'input[name*=forwarder]',
			'input[name*=station]'
		];

		arr.forEach(function(value, index, arr) {
			inputs.forEach(function(v, i, inputs) {
				// nodesInput = data[array][item]
				row[index].querySelector(v).value = arr[index][i];
			});
		});

		return true
	}
	// 4
	function makeBooking() {
		document.querySelector("#btn_reserv").click();
		console.log("MAKE_BOOKING");
	}
	// 5

	// 6 
	function createPanel() {
		let b = document.querySelector('body');
		b.insertAdjacentHTML('afterbegin', '<div id="TOP_PANEL_SCRIPT"><button id="TPS_START">START</button> <div id="TPS_STATUS">deactivated</div> <input type="file" id="FILE"> <button id="TPS_CANCEL">CANCEL</button></div>');
		let paneCont = document.querySelector("#TOP_PANEL_SCRIPT");
		paneCont.style.background = '#ffddbb';
		paneCont.style.padding = '10px';
		paneCont.style.display = 'flex';
		paneCont.style.justifyContent = 'flex-start';
		paneCont.style.boxShadow = '1px 3px 8px 0px #0000006e';

		let start = document.getElementById("TPS_START");
		start.style.marginRight = '10px';
		// start.addEventListener('click', function(){
		// 	console.log("test");
		// });

		let status = document.getElementById("TPS_STATUS");
		status.style.border = '1px solid black';
		status.style.padding = '1px 10px';
		status.style.marginRight = '10px';

		let file = document.getElementById("FILE");
		file.style.marginRight = '10px';
	}

	function execute(){
		setStatus("working");
		
		const arr = parseCSV(MAIN.data);
		console.log(arr);

		cloneRow(arr)
		fillFirstRow('#formReservation .rowFields', arr[0]);
		fillRows('#formReservation .boxListCopyesFields .rowFields', arr);

		setStatus("pause");
	}

	// check ERRORS
	function disableValidate(){
		document.querySelectorAll("#formReservation .rowFields").forEach(function(v,i,arr){
			arr[i].querySelector(".form-group input").click();
		})
	}

	
// MAIN LOGIC:
// 6 
createPanel();

// upload file
const file = document.getElementById('FILE');
file.addEventListener('change', function(e){
	selectFile(e);
}, false);

// start script
let start = document.getElementById("TPS_START");
start.addEventListener('click', function(){
	MAIN.isBooked = false;
	execute();
});

// stop script
let stop = document.getElementById("TPS_CANCEL");
stop.addEventListener('click', function(){
	MAIN.isBooked = true;
});



// wait response from the server
	// ERROR 
	// deactivate validate on inputs
/* 	let form = document.querySelector("#formReservation");
	form.addEventListener('DOMNodeInserted', function(){
		if( !MAIN.isBooked ) {
			disableValidate();
			makeBooking();
			console.log('WORKING');
		} else {
			console.log('STOPED EXECUTE');
		}
	}); */

	// SUCCESS
	$('#applyOrder').on('show.bs.modal', function (e) {
		// console.log("MODAL WAS SHOW");
		MAIN.isBooked = true;
		alert("Booking is Done");
		throw "BREAK - DONE";
	})


// Select the node that will be observed for mutations
const targetNode = document.getElementById('formReservation');
const config = { attributes: true, childList: true, subtree: true };

function callback(mutationsList, observer) {
	let counter = 0;
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
			console.log('Child node', mutation);
			counter++;
		}
	}

	console.log("counter:", counter);

	if( counter && !MAIN.isBooked ){
		disableValidate();
		console.log('OBSERVE: WORKING');
		makeBooking();
	} else {
		alert("form did not change");
	}

};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
observer.observe(targetNode, config);
// observer.disconnect();







});