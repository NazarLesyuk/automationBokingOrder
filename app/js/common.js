document.addEventListener("DOMContentLoaded", function(){

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
			console.log("click btn-cp")
		});
	});
	document.querySelector("#btn_reserv").addEventListener("click", function(){
		console.log("click btn_reserv")
	});



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

// Functions:
	// 2.1
	function selectFile(e) {
		// Check for the various File API support.
		if ( window.File && window.FileReader && window.FileList && window.Blob) {
			console.log("Great success! All the File APIs are supported");
			let file = e.target.files; // FileList object
			file = file[0];
			let result;
	
			console.log(file);
			console.log(typeof file.type);
			// check 
			if (file.name.indexOf('csv') === -1) {
			// if (file.type.indexOf('csv') === -1) {
			// if (!file.type.match('csv.*')) {
			// if (!file.type.startsWith('csv')) {
				alert(" Не вірний формат файлу, допускається - CSV");
				document.getElementById("TPS_STATUS").innerHTML = 'failed';
				return false
			}
	
			// read file
			const reader = new FileReader();
			reader.readAsText(file);
			console.log(reader.readyState); // 1 - loading 
	
			reader.onload = function(){
				console.log(reader.readyState); // 2 - done
				console.log(reader.result)
				result = reader.result;
			}
	
			// shachge status
			document.getElementById("TPS_STATUS").innerHTML = 'ready';
			return result;
		} else {
			console.log('The File APIs are not fully supported in this browser.');
		}
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
	}
	// 5

	// 6 
	function createPanel() {
		let b = document.querySelector('body');
		b.insertAdjacentHTML('afterbegin', '<div id="TOP_PANEL_SCRIPT"><button id="TPS_START">START</button> <div id="TPS_STATUS">deactivated</div> <input type="file" id="FILE"></div>');
		let paneCont = document.querySelector("#TOP_PANEL_SCRIPT");
		paneCont.style.background = '#ffddbb';
		paneCont.style.padding = '10px';
		paneCont.style.display = 'flex';
		paneCont.style.justifyContent = 'flex-start';
		paneCont.style.boxShadow = '1px 3px 8px 0px #0000006e';

		let start = document.getElementById("TPS_START");
		start.style.marginRight = '10px';
		start.addEventListener('click', function(){
			console.log("test");
		});

		let status = document.getElementById("TPS_STATUS");
		status.style.border = '1px solid black';
		status.style.padding = '1px 10px';
		status.style.marginRight = '10px';

		let file = document.getElementById("FILE");
		file.style.marginRight = '10px';
	}

/* + 1 */
// var status = confirm("activate the script?");
// var status = true;

// 6 
createPanel();



// upload file
const file = document.getElementById('FILE');
file.addEventListener('change', selectFile, false);


var status = false;
if(!status) throw "Script was deactivate";

/* + 2 Parse DATA */
const data = `
Номер вагона;Грузополучатель;жд код;Собственник груза;Жд код;Экспедитор;Станция
60635208;"ОАО "Красносельскстройматериалы"";4013;"ООО ""Тэктранс""";8219973;"ООО ""Украгротехсервис""";137307
63711386;"ОАО ""Красносельскстройматериалы""";4014;"ООО ""Тэктранс""";8219973;"ООО ""Украгротехсервис""";137307
64180235;"ОАО ""Красносельскстройматериалы""";4015;"ООО ""Тэктранс""";8219973;"ООО ""Украгротехсервис""";137307
61434239;"ОАО ""Красносельскстройматериалы""";4016;"ООО ""Тэктранс""";8219973;"ООО ""Украгротехсервис""";137307
65264483;"ОАО ""Красносельскстройматериалы""";4017;"ООО ""Тэктранс""";8219973;"ООО ""Украгротехсервис""";137307
`;
const arr = parseCSV(data);
arr.shift(); // delete titles
console.log(arr);


/* + 3 Fill all rows */
/* + 3.1 */
setTimeout(function(){
	cloneRow(arr)
}, 500);

/* + 3.2 */
setTimeout(function(){
	fillFirstRow('#formReservation .rowFields', arr[0]);
}, 1000);

/* 3.3 */
setTimeout(function(){
	fillRows('#formReservation .boxListCopyesFields .rowFields', arr);
}, 1500);


/* 4 */
setTimeout(function(){
	// makeBooking();
}, 1600);





});