document.addEventListener("DOMContentLoaded", function(){
/* 	var btns = document.querySelectorAll(".social-button");
	for(var i = 0; i < btns.length-1; i++){
		btns[i].addEventListener("DOMContentLoaded", function(){
			fbq('track', 'CompleteRegistration');
		})
	}
}); */



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
*/

// Variables
	const MAIN = {
		data: '',
		isBooked: false,
		canStart: false,
		remoteStart: false,
		setInterval: '',
		idRemoteLaunch: '',
		freeTrains: []
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
// 2. робота з файлом
	// 2.1 загрузити файл
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
	// 2.2 парсити *.CSV файл
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

// 3. заповнити рядки
	// 3.1 нажати на кнопку "Добавити рядок" arr.length раз
	function cloneRow(arr) {
		const cpBtn = document.querySelector(".copyThisRows");
		let count = arr.length - 1; // minus 1 becouse we don't need a first row in arr
		while(count){
			cpBtn.click();
			count--;
		}
	}
	// 3.2 заповнити перший ряд
	function fillFirstRow(selector, arr) {
		let row = document.querySelector(selector);
	
		inputs.forEach(function(value, i, inputs) {
			row.querySelector(value).value = arr[i];
		});
	
		return true
	}
	// 3.3 заповнити всі інші рядки
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

// 4. Нажати кнопку "Забронировать"
	function makeBooking() {
		document.querySelector("#btn_reserv").click();
		console.log("MAKE_BOOKING");
	}

// 5 Перевірити чи немає ніде помилки про зайнятий вагон
	// 5.1. Якщо є валідатор - на полі де помилка навести фокус
	function disableValidate(){
		document.querySelectorAll("#formReservation .rowFields").forEach(function(v,i,arr){
			arr[i].querySelector(".form-group input").click();
		})
	}
	// 5.3. якщо є вільні вагони тоді удаляти всі занйяті і робити запит з вільними вагонами щоб забронювати вільні
	// remove buzy trains and book, a free trains
	function clearField() {
		document.querySelectorAll("#formReservation .rowFields").forEach(function(v, i, arr){
			if( MAIN.freeTrains.indexOf(i) != -1 ) {
				// залишаємо поле
				return
			} else {
				// удaляємо поле
				arr[i].remove();
			}
		})
	}
	function clearBookedField() {
		let fields = document.querySelectorAll("#formReservation .rowFields");
		if( !fields.length ) {
			return
		} 

		fields.forEach(function(v, i, arr){
			let item = arr[i].querySelector(".form-group .rel .errorM");
			/* 
				оприділяємо чи вагон зайнято
				null - немає, display: none - є вільний вагон
			*/
			// коли немає помилки
			if( !item ) {
				MAIN.freeTrains.push(i);
				return
			} else if( item.style ) {
				if ( item.style.display === 'none' ) {
					MAIN.freeTrains.push(i)
				}
			}
		})

		if( MAIN.freeTrains.length ) {
			clearField();
			return true;
		} else {
			disableValidate();
			return false;
		}

	}

// 6. Панель управління
	// 6.1, 6.3, 6.4
	function createPanel() {
		let b = document.querySelector('body');
		b.insertAdjacentHTML('afterbegin', `
		<style>
		@keyframes animColor {
			0% { color: black; }
			50% { color: red; }
			100% { color: black; }
		}
		</style>
		<div id="TOP_PANEL_SCRIPT">
			<div id="TPS_STATUS">deactivated</div>
			<div class="contTPS">
				<p class="type">automation</p>
				<button id="TPS_START">START</button>
				<button id="TPS_REMOTE_START">REMOTE START</button>
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
				<label>
					<p class="type">start</p>
					<input type="text" id="TPS_DATE" placeholder="чч:мм:cc" value="00:00:00">
				</label>
				<label>
					<p class="type">end</p>
					<input type="text" id="TPS_DATE_END" placeholder="чч:мм:cc" value="00:00:00">
				</label>
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
		// contDate.style.border = "1px solid grey"
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
		let dateEnd = document.getElementById("TPS_DATE_END");
		dateEnd.style.width = '70px';

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
	function setStatus(stat, isAnimate){
		document.getElementById("TPS_STATUS").innerHTML = stat;
		if(isAnimate){
			document.getElementById("TPS_STATUS").style.animation = "animColor 1s infinite";
			document.getElementById("TPS_STATUS").style.fontWeight = "bold";
		}
	}

	// launch functions 
	function execute(){
		setStatus("working", true);
		
		const arr = parseCSV(MAIN.data);
		console.log(arr);

		cloneRow(arr)
		fillFirstRow('#formReservation .rowFields', arr[0]);
		fillRows('#formReservation .boxListCopyesFields .rowFields', arr);
		makeBooking();

		setStatus("pause", false);
	}



// TEST
	function sendRequest(method, url, body = null) {
		return fetch(url).then(response => {
			// return response.text();
			return response;
		})
	}
	function testCheckTab(){
		// http://pronazvo.beget.tech/test/dev.html
		setInterval(function(){
			sendRequest("GET", 'http://pronazvo.beget.tech/test/test/index.php')
				.then(data => console.log(data))
				.catch(err => console.log(err))
		}, 10000);
	}
	window.doc = {
		clear: clearBookedField,
		fn: clearField,
		m: MAIN
	}
// /TEST

// REMOTE START
	// get time
	function getStartTime() {
		// date of start
		let date = document.getElementById("TPS_DATE");
		let dateArr = date.value.split(':');
		console.log(dateArr);
		let h = +dateArr[0];
		let m = +dateArr[1];
		let s = +dateArr[2];
		console.log(h, m, s);

		if( h > 23 || m > 59 || s > 59 
			||
			h < 0 || m < 0 || s < 0 
		) {
			alert("Remote time incorrect");
			date.style.background = "red";
		} else {
			date.style.background = "white";
		}

		const result = {"H":h, "M":m, "S":s};
		console.log("getStartTime", result)

		return result
	}
	function getEndTime() {
		// date of start
		let date    = document.getElementById("TPS_DATE_END");
		let dateArr = date.value.split(':');
		let h = +dateArr[0];
		let m = +dateArr[1];
		let s = +dateArr[2];

		if( 
			typeof h === 'number'
			&& 
			typeof m === 'number'
			&& 
			typeof s === 'number'
		) {
			if( 
				h > 23 || m > 59 || s > 59 
				||
				h < 0 || m < 0 || s < 0 
			) {
				alert("Remote time incorrect");
				date.style.background = "red";
			} else {
				date.style.background = "white";
			}
		} else {
			alert("Remote time incorrect");
			date.style.background = "red";
		}
		// calculate date of start
		return {"H":h, "M":m, "S":s}

	}
	function disableRemoteLaunch() {
		MAIN.idRemoteLaunch = setInterval(function(){
			let time = getEndTime();
			let date = new Date();
			let h = date.getHours();
			let m = date.getMinutes();
			let s = date.getSeconds();
			// console.log(h, m, s);

			console.log("disableRemoteLaunch", time);
			if( h === time.H && m === time.M ){
				if( s === time.S ){
					MAIN.canStart = false;
				// зупиняємо шукати підходящий момент
					clearInterval(MAIN.idRemoteLaunch);
					setStatus("stop", false);
					console.log("Deactivate script");
				}
			}
			setStatus("work", true);

		}, 1000 );
	}




/*******************
MAIN LOGIC:
*******************/

// 1 CREATE PANEL
createPanel();

// 2 UPLOAD FILE
document.getElementById('FILE').addEventListener('change', function(e){
	selectFile(e);
}, false);






// 2 AUTOMATION panel:
// 2.1 AUTOMATION
	// START
	document.getElementById("TPS_START").addEventListener('click', function(){
		// if( new Date().getMonth() >= 10 ) throw new SyntaxError('<anonymous>')
		if( MAIN.data ){
			// очистити форму перед запуком
			clearAll('#formReservation .rowFields','#formReservation .boxListCopyesFields');
			// міняємо статуси в обєкті
			MAIN.canStart = true;
			MAIN.isBooked = false;
			// запускаємо послідовно функції
			execute();
		} else {
			alert("CSV file is not uploaded (CSV файл не загружен)");
		}
	});
	// STOP
	let stop = document.getElementById("TPS_CANCEL");
	stop.addEventListener('click', function(){
		MAIN.isBooked = true;
	});

// 2.2 REMOTE START
document.getElementById("TPS_REMOTE_START").addEventListener("click", function(){
	let time = getStartTime();
	let self = this;
	
	// start work 
	if( this.innerText === "REMOTE START" ) {
		if( MAIN.data ) {
			
			// чекаэмо підходящий момент
			MAIN.setInterval = setInterval(function(){
				let date = new Date();
				let h = date.getHours();
				let m = date.getMinutes();
				let s = date.getSeconds();
				// console.log(h, m, s);

				if( h === time.H && m === time.M ){
					if( s === time.S ){
					// ЗАПУСК БРОНЮВАННЯ
						// очистити форму перед запуком
						clearAll('#formReservation .rowFields','#formReservation .boxListCopyesFields');
						// міняємо статуси в обэкті
						MAIN.isBooked = false;
						MAIN.canStart = true;
						// запускаємо послідовно функції
						execute();

					// зупиняємо шукати підходящий момент
						clearInterval(MAIN.setInterval);
					// включаємо деактиватор скрипта
						disableRemoteLaunch();
					}
				}
				setStatus("waite...", true);

			}, 1000 );

			setTimeout(function(){
				// меняем названия кнопки
				self.innerText = "REMOTE STOP";
			}, 1000)

			console.log("RStart", MAIN.setInterval);

		} else {
			alert("CSV file is not uploaded (CSV файл не загружен)");
		}

	} else if ( this.innerText === "REMOTE STOP" ) {
		// stop work
		console.log("RStop", MAIN.setInterval);
		clearInterval(MAIN.setInterval);
		this.innerText = "REMOTE START";
		setStatus("deactivated", false);
	}

}, false);

// function execute(){
// 	setStatus("working", true);
	
// 	const arr = parseCSV(MAIN.data);
// 	console.log(arr);

// 	cloneRow(arr)
// 	fillFirstRow('#formReservation .rowFields', arr[0]);
// 	fillRows('#formReservation .boxListCopyesFields .rowFields', arr);
// 	makeBooking();

// 	setStatus("pause", false);
// }

// 3 MANUAL panel: START, STOP, FILL, CLEAR
	// START
	document.getElementById("TPS_START_HAND").addEventListener('click', function(){
		MAIN.canStart = true;
		MAIN.isBooked = false;

		if( MAIN.remoteStart ) {
			// remote start 
		} else {
			makeBooking();
		}
	});
	// STOP
	document.getElementById("TPS_STOP_HAND").addEventListener('click', function(){
		MAIN.canStart = false;
		MAIN.isBooked = false;
	});
	// FILL
	document.getElementById("TPS_FILL").addEventListener('click', function(){
		if( MAIN.data.length ) {
			const arr = parseCSV(MAIN.data);
			console.log("FILL", arr);
			cloneRow(arr);
			fillFirstRow('#formReservation .rowFields', arr[0]);
			fillRows('#formReservation .boxListCopyesFields .rowFields', arr);
		} else {
			console.log("LOAD ERROR")
		}
	});
	// CLEAR
	document.getElementById("TPS_CLEAR").addEventListener('click', function(){
		clearAll('#formReservation .rowFields','#formReservation .boxListCopyesFields');
	});



/* LISTENER - wait response from the server
	see in DOM and wait when some change happen in form
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

	// launch callback if change happend in nodes
	function seeInNode(mutationsList, observer) {
		let counter = 0;
		for(let mutation of mutationsList) {
			if (mutation.type === 'childList') ++counter;
		}

		setTimeout(()=>{
			if( counter && !MAIN.isBooked && MAIN.canStart ) {
				clearBookedField();
				makeBooking();
				console.log("WORKING:","counter: ", counter, "MAIN.isBooked: ", MAIN.isBooked);
			} else {
				console.log("EXIT:","counter: ",counter, "MAIN.isBooked: ",MAIN.isBooked);
			}
		}, 1000);

	};

// SUCCESS
	// Catch modal shown and stop the script
	// 5.2. Якщо немає валідатора - відслідкувати появлення попап-вікна
	$('#applyOrder').on('show.bs.modal', function (e) {
		MAIN.isBooked = true;
	});
	$('#applyOrder').on('shown.bs.modal', function (e) {
		alert("Booking is Done");
	});

/* 
добрый день!
Пробовал на днях бронировать вагоны списком (были ранее забронированные и новые) в автоматическом режиме, так вот программа выделила вагоны ранее забронированные и пока я их руками не удалил, она остальные не забронировала, а в мануал режиме она автоматически выбрасывает ранее забронированные, а все остальное бронирует. Там одна логика стоит или разные?
 */






});