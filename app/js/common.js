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



// SCRIPT
/* 
Steps:
- 1. Запитати чи запустити программу
+ 2. робота з файлом
	+2.1. загрузити файл
	+2.2. парсити *.CSV файл
+ 3. заповнити рядки
	+3.1. нажати на кнопку "Добавити рядок"
	+3.2. заповнити перший ряд
	+3.3. заповнити всі інші рядки
+ 4. Нажати кнопку "Забронировать"
+ 5. Перевірити чи немає ніде помилки про зайнятий вагон
	+5.1. Якщо є валідатор - на полі де помилка навести фокус
	+5.2. Якщо немає валідатора - відслідкувати появлення попап-вікна
	-5.3. якщо є вільні вагони тоді удаляти всі занйяті і робити запит з вільними вагонами щоб забронювати вільні
- 6. Панель управління
	+6.1. Кнопка старт
		+1 запускає процес
		-2 чистити форму перед запуском
	+6.2. Статус
	+6.3. Кнопка загрузити файл
	+6.4. Кнопка Cancel
	-6.5. Поле date - затримка сервера [mm,ss] (00:01:38 - затримка, тоді запуск скрипта пізніше на цей час)
	-6.5. Поле date - старт скрипта [hh,mm,ss], час роботи скрипта [ss]
	-6.6. Вивести час
- 7. Обробка результата сервера
. удаляти вагон який заблокирован
*/

// Variables
	const MAIN = {
		isBooked: false,
		canStart: false,
		remoteStart: false
	};
	const inputs = [
		'input[name*=wagon_number]',
		'input[name*=consignee]',
		'input[name*=code_recipient]',
		'input[name*=cargo_owner]',
		'input[name*=code_owner]',
		'input[name*=forwarder]',
		'input[name*=station]'
	];

// Functions:
	// 2.1
	function selectFile(e) {
		// Check for the various File API support.
		if ( window.File && window.FileReader && window.FileList && window.Blob) {
			let file = e.target.files; // FileList object
			file = file[0];
	
			console.log(file);
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
				MAIN.data = reader.result;
				
				setStatus("ready");
				return reader.result;
			}
		} else {
			console.log('The File APIs are not fully supported in this browser.');
		}
	}
	// 2.2
	function parseCSV(data){
		let clrArr = [];
		let arr = data.toString().split('\n');
		// console.log('1====',arr)
		
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
		// clrArr.shift(); // delete titles

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
	
		inputs.forEach(function(value, i, inputs) {
			row.querySelector(value).value = arr[i];
		});
	
		return true
	}
	// 3.3
	function fillRows(selector, arr){
		let row = document.querySelectorAll(selector);
		arr.shift();

		arr.forEach(function(value, index, arr) {
			inputs.forEach(function(v, i, inputs) {
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

	// 6, 6.1, 6.3, 6.4
	function createPanel() {
		let b = document.querySelector('body');
		b.insertAdjacentHTML('afterbegin', `
		<div id="TOP_PANEL_SCRIPT">
			<div id="TPS_STATUS">deactivated</div>
			<div class="contTPS">
				<p class="type">automation</p>
				<button id="TPS_START">START</button>
				<button id="TPS_CANCEL">CANCEL</button>
			</div>
			<div class="contTPS">
				<p class="type">manual</p>
				<button id="TPS_FILL">1-Fill</button>
				<button id="TPS_START_HAND">2-Start</button>
				<button id="TPS_STOP_HAND">3-Stop</button>
				<button id="TPS_CLEAR">4-Clear</button>
			</div>
			<div class="contTPS TPS_ContDate">
				<!-- <label> завтра
					<input type="checkbox" id="isTomorrow">
				</label> -->
				<input type="text" id="TPS_DATE" placeholder="чч:мм:cc" value="23:57:22">
				<input type="text" id="TPS_DATE_CORRECTION" placeholder="мм:сс" value="1:22">
				<button id="TPS_DATE_BTN">btn</button>
			</div>
			<input type="file" id="FILE">
		</div>
		`);
		// container
		let paneCont = document.getElementById("TOP_PANEL_SCRIPT");
		paneCont.style.background = '#ffddbb';
		paneCont.style.padding = '10px';
		paneCont.style.display = 'flex';
		paneCont.style.justifyContent = 'space-between';
		paneCont.style.justifyContent = 'flex-start';
		paneCont.style.alignItems = 'center';
		paneCont.style.boxShadow = '1px 3px 8px 0px #0000006e';

		// status
		let status = document.getElementById("TPS_STATUS");
		status.style.border = '1px solid black';
		status.style.padding = '1px 5px';
		status.style.marginRight = '5px';

		// choose file
		let file = document.getElementById("FILE");
		file.style.marginRight = '10px';
		file.style.width = '100px';


		// small containers
		let cont = document.querySelectorAll("#TOP_PANEL_SCRIPT .contTPS");
		for( let i = 0; i < cont.length; i++ ){
			cont[i].style.display = 'flex';
			cont[i].style.marginLeft = '8px';
			cont[i].style.justifyContent = 'center';
			cont[i].style.flexWrap = 'wrap';
		}
			// title in container
			let type = document.querySelectorAll("#TOP_PANEL_SCRIPT .contTPS .type");
			for( let i = 0; i < type.length; i++ ){
				type[i].style.width = '85%';
				type[i].style.textAlign = 'center';
				type[i].style.fontSize = '10px';
				type[i].style.padding = '0';
				type[i].style.margin = '0';
			}

		// remote start
		let contDate = document.querySelector("#TOP_PANEL_SCRIPT .TPS_ContDate");
		contDate.style.display = 'flex'
		contDate.style.flexWrap = 'nowrap';
		contDate.style.justifyContent = 'space-between';
		contDate.style.alignItems = 'center';
		contDate.style.border = "1px solid grey"
		contDate.style.margin = '0 10px';
		// checkbox
		// let label = contDate.querySelector("label")
		// label.style.display = 'flex';
		// label.style.justifyContent = 'flex-start';
		// label.style.alignItems = 'center';
		// label.style.padding = '0 5px';
		// choose time for remote start
		let date = document.getElementById("TPS_DATE");
		date.style.width = '70px';
		let dateCor = document.getElementById("TPS_DATE_CORRECTION");
		dateCor.style.width = '50px';


	}
	// 6.1.2 Clear before start
	function clearAll(selectorFirst, selectorOther) {
		document.querySelector(selectorOther).innerHTML = '';
		let row = document.querySelector(selectorFirst);

		inputs.forEach(function(value, i, inputs) {
			row.querySelector(value).value = '';
		});


		return true
	}
	// 6.2
	function setStatus(stat){
		document.getElementById("TPS_STATUS").innerHTML = stat;
	}

	// launch functions 
	function execute(){
		setStatus("working");
		
		const arr = parseCSV(MAIN.data);
		console.log(arr);

		cloneRow(arr)
		fillFirstRow('#formReservation .rowFields', arr[0]);
		fillRows('#formReservation .boxListCopyesFields .rowFields', arr);
		makeBooking();

		setStatus("pause");
	}

	// disable validate notifications(ERRORS)
	function disableValidate(){
		document.querySelectorAll("#formReservation .rowFields").forEach(function(v,i,arr){
			arr[i].querySelector(".form-group input").click();
		})
	}

	// REMOTE START
	function getStartTime() {
		// tomorrow input
		// let isTomorrow = document.getElementById("isTomorrow").checked;
		// console.log(isTomorrow)

		// date
		let date = document.getElementById("TPS_DATE");
		console.log(date )
		let dateArr = date.value.split(':');
		console.log(dateArr);
		let h = dateArr[0];
		let m = dateArr[1];
		let s = dateArr[2];
		if( h > 23 || m > 59 || s > 59 ) {
			alert("Remote time incorrect");
			date.style.background = "red"
		} else {
			date.style.background = "white"
		}

		// shift
		let shift = document.getElementById("TPS_DATE_CORRECTION");
		console.log(shift.value, typeof shift.value)
		let shiftArr = shift.value.split(":")
		let shiftM = shiftArr[0];
		let shiftS = shiftArr[1];
		if( shiftM > 59 || shiftS > 59 ) {
			alert("Shift time incorrect");
			shift.style.background = "red"
		} else {
			shift.style.background = "white"
		}

	}

	



// MAIN LOGIC:
// 1 CREATE PANEL
createPanel();


// DATE SHIFT AND START
getStartTime();
document.getElementById("TPS_DATE_BTN").addEventListener("click", function(){
	getStartTime()
}, false);


// UPLOAD FILE
document.getElementById('FILE').addEventListener('change', function(e){
	selectFile(e);
}, false);

// 1.1 AUTOMATION 
	// start
	document.getElementById("TPS_START").addEventListener('click', function(){
		// if( new Date().getMonth() >= 10 ) throw new SyntaxError('<anonymous>')
		MAIN.isBooked = false;
		MAIN.canStart = true;
		execute();
	});
	// stop
	let stop = document.getElementById("TPS_CANCEL");
	stop.addEventListener('click', function(){
		MAIN.isBooked = true;
	});

// 1.2 MANUAL panel: START, STOP, FILL, CLEAR
	// start
	document.getElementById("TPS_START_HAND").addEventListener('click', function(){
		MAIN.canStart = true;
		MAIN.isBooked = false;

		if( MAIN.remoteStart ) {
			// remote start 


		} else {
			makeBooking();
		}
	});
	// stop
	document.getElementById("TPS_STOP_HAND").addEventListener('click', function(){
		MAIN.canStart = false;
		MAIN.isBooked = false;
	});
	// fill
	document.getElementById("TPS_FILL").addEventListener('click', function(){
		const arr = parseCSV(MAIN.data);
		console.log("FILL", arr);
		cloneRow(arr);
		fillFirstRow('#formReservation .rowFields', arr[0]);
		fillRows('#formReservation .boxListCopyesFields .rowFields', arr);
	});
	// clear
	document.getElementById("TPS_CLEAR").addEventListener('click', function(){
		clearAll('#formReservation .rowFields','#formReservation .boxListCopyesFields');
	});



/* LISTENER - wait response from the server
	see in DOM and when will be some change in form
*/
	// ERROR
	const observer = new MutationObserver(seeInNode);
	const targetNode = document.getElementById('formReservation');
	const config = {
		attributes: true,
		childList: true,
		subtree: true
	};
	observer.observe(targetNode, config);

	function seeInNode(mutationsList, observer) {
		let counter = 0;

		for(let mutation of mutationsList) {
			if (mutation.type === 'childList') ++counter;
		}

		setTimeout(()=>{
			if( counter && !MAIN.isBooked && MAIN.canStart ) {
				disableValidate();
				makeBooking();
				console.log("WORKING: ","counter: ",counter, "MAIN.isBooked: ",MAIN.isBooked);
			} else {
				console.log("EXIT:","counter: ",counter, "MAIN.isBooked: ",MAIN.isBooked);
			}
		}, 1000);

	};

	// SUCCESS
	// Catch modal shown and stop the script
	$('#applyOrder').on('show.bs.modal', function (e) {
		MAIN.isBooked = true;
	});
	$('#applyOrder').on('shown.bs.modal', function (e) {
		alert("Booking is Done");
	});










});