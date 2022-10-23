'use strict';

// https://restcountries.com/v2/all?fields=name,capital //?Все столицы и страны
// https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key} //? Погода в столице

const city = document.querySelector('.cityName');
const temp = document.querySelector('.temp__count');
const description = document.querySelector('.temp__description');
const icon = document.querySelector('.weather__icon');
const wind = document.querySelector('.temp__wind');
const select = document.querySelector('#select');
const widget = document.querySelector('.weatherBlock');

//? функция для чтения данных из SessionStorage и их запись в HTML теги
function initial() {
	const data = JSON.parse(sessionStorage.getItem('weather')); // конвертирование в объект
	if (data) {
		//если data !null то делаем:
		city.innerHTML = data.cityName;
		temp.textContent = data.tempCount;
		description.textContent = data.tempDescription;
		icon.innerHTML = data.weatherIcon;
		wind.innerHTML = data.tempWind;

		changeColorWidget(data.tempCount); //вызов функции для смены цвета виджета
		const options = document.querySelectorAll('option'); //поиск по всем option'am
		for (let option of options) {
			option.selected = false; //по дефолту не будет выбранного option'a
			if (option.value === data.cityName) {
				//если value(город) содержит такой же город, то выделяем option как выбранный
				option.selected = true;
			}
		}
	}
	//? чтение данных какие были координаты до перезагрузки страницы
	const movingData = JSON.parse(sessionStorage.getItem('position')); //конвертируем в объект
	if (movingData) {
		//если не null то перемещаем виджет на координаты:
		widget.style.top = movingData.Y - 30 + 'px';
		widget.style.left = movingData.X - 150 + 'px';
	}
}

//? функция изменения цвета по температуре
function changeColorWidget(tempCount) {
	if (tempCount > 0 && tempCount <= 20) {
		widget.classList.add('normal');
		widget.classList.remove('cold', 'hot');
	} else if (tempCount < 0) {
		widget.classList.add('cold');
		widget.classList.remove('hot', 'normal');
	} else if (tempCount > 20) {
		widget.classList.add('hot');
		widget.classList.remove('cold', 'normal');
	} else {
		widget.classList.remove('hot', 'cold', 'normal');
	}
}

//? функция получения api стран и столиц
async function getOptions() {
	try {
		//получение api
		const response = await fetch('https://restcountries.com/v2/all?fields=name,capital');
		//преобразовываем полученные данные в объект
		const data = await response.json();
		//? отправляем в addAllOptions
		return data;
	} catch (error) {
		//если произошла ошибка, то выводим:
		console.log(error);
		alert(error);
	}
}

//? функция заполнения select'a странами
async function addAllOptions() {
	//получаем данные с api стран и столиц
	const options = await getOptions();
	//? цикл проверки всех объектов
	for (let option of options) {
		if (option.capital !== undefined && option.capital !== 'King Edward Point') {
			// создаем элемент option на странице HTML, который потом поместим в select
			const optionNode = document.createElement('option');
			// название Британии очень длинное и из-за этого весь select чересчур длинный
			// условием сокращаю название до более короткого
			if (option.name === 'United Kingdom of Great Britain and Northern Ireland') {
				optionNode.innerHTML = 'United Kingdom';
			} else {
				//запись в текст - страны
				optionNode.innerHTML = option.name;
			}
			//запись в value - столицыы
			optionNode.value = option.capital;
			//добавление в select option'ы с странами и столицами
			select.appendChild(optionNode);
		}
	}
	initial(); //получаем все option'ы и потом вызываем функцию
}
addAllOptions();

//! -----------Блок обновления погоды каждые 10 секунд-------------//
//? событие выбора страны
let globalCapital; //название столицы
select.addEventListener('change', () => {
	// отправляем в виджет выбранную страну(столицу)
	globalCapital = select.value;
	getWeather(select.value);
});

//? вызов функции каждые 10 секунд
setInterval(() => {
	//если город не null, не false, не пустая строка
	if (globalCapital) {
		getWeather(globalCapital);
	}
}, 60000);
//! --------------------------------------------------------//

//? функция (2-API) удаляет все символы кроме цифр
function getNumbersFromString(string) {
	let numberPattern = /\d+/g; // регулярное выражение
	let numbers = string.match(numberPattern);
	return numbers;
}

//? функция получения api по столице и заполнения виджета данными о погоде
async function getWeather(capital) {
	let tempCount; //переменные для короткого хранения данных
	let tempDescription;
	let weatherIcon;
	let tempWind;

	try {
		//!-------------------------1-API------------------------------//
		try {
			//? метод который через 5 сек вызывает прерывание запрос

			let controller = new AbortController(); // Встроенный метод который юзаем для отмены fetch
			setTimeout(() => {
				controller.abort();
			}, 5000);

			const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=fb876a71a8844bf7dbd7aa9a8080a2e9`, {
				signal: controller.signal, //передаем сигнал (сигнал: значение сигнала)
			});
			const data = await response.json(); //преобразование полученных данных в объект

			//? преобразование данных и запись в отдельные переменные
			tempCount = temp.textContent = Math.round(data.main.temp - 273);
			tempDescription = data.weather[0].description;
			weatherIcon = `<img src = ./img/${data.weather[0].icon}@2x.png>`;
			tempWind = data.wind.speed + ' м/c';
			//!------------------------↓ 2-API ↓-------------------------------//
		} catch {
			//? если не выполняется запрос с 1 API то выполняем запрос с другой
			const response = await fetch(`https://goweather.herokuapp.com/weather/${capital}`);
			const data = await response.json();

			//? преобразование данных и запись в отдельные переменные 2-API
			tempCount = Math.round(getNumbersFromString(data.temperature));
			tempDescription = data.description;
			weatherIcon = `<img src = ./img/temperatureicon.png>`;
			tempWind = Math.round(getNumbersFromString(data.wind) / 3.6) + ' м/c';
		}

		//? запись в HTML теги, отформатированные данные
		city.textContent = capital;
		temp.textContent = tempCount;
		description.textContent = tempDescription;
		icon.innerHTML = weatherIcon;
		wind.innerHTML = tempWind;

		//!-------------------Блок сохранения [sessionStorage]---------------//
		//? создание объекта куда записывается вся инфа
		const savedData = {
			cityName: capital,
			tempCount: tempCount,
			tempDescription: tempDescription,
			weatherIcon: weatherIcon,
			tempWind: tempWind,
		};
		//? конвертирование объекта в строку и запись в sessionStorage
		sessionStorage.setItem('weather', JSON.stringify(savedData));
		//!---------------------------------------------------------------//

		//?изменение фона виджета в зависимости от температуры
		changeColorWidget(tempCount);
	} catch (error) {
		console.log(error);
		alert(error);
	}
}

//!-------------------*Блок перемещения виджета---------------//
widget.addEventListener('mousedown', mouseDown); // событие когда нажал
window.addEventListener('mouseup', mouseUp); // событие когда отпустил (window глобальный объект - окно странички)

function mouseDown() {
	window.addEventListener('mousemove', move); // добавляет событие передвижения
}
function mouseUp() {
	window.removeEventListener('mousemove', move); // удаляет событие передвижения
}

function move(e) {
	// передвижение виджета
	widget.style.top = e.clientY + -30 + 'px';
	widget.style.left = e.clientX + -150 + 'px';

	const movingData = {
		X: e.clientX,
		Y: e.clientY,
	};
	//? конвертирование объекта в строку и запись в sessionStorage
	sessionStorage.setItem('position', JSON.stringify(movingData));
}
//!---------------------------------------------------------------//
