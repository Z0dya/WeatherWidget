'use strict'

// https://restcountries.com/v2/all?fields=name,capital //?Все столицы и страны
// https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key} //? Погода в столице

const select = document.querySelector("#select"); //обращаемся к select'y
addAllOptions()




//функция получения api стран и столиц
async function getOptions() {
	try {
		//получение api
		const response = await fetch('https://restcountries.com/v2/all?fields=name,capital')
		//преобразовываем полученные данные в объект
		const data = await response.json();
		//? отправляем в addAllOptions
		return data;

	}
	//если произошла ошибка, то выводим:
	catch (error) {
		console.log(error);
		alert(error);
	}
}


// копируем название города
let globalCapital;
//вызываем эту функцию каждые 10 секунд
setInterval(() => {
	//если город не null, не false, не пустая строка
	if (globalCapital) {
		getWeather(globalCapital);
	}
}, 10000);

//функция заполнения select'a странами
async function addAllOptions() {
	//получаем данные с api стран и столиц
	const options = await getOptions();
	//? цикл проверки всех объектов
	for (let option of options) {
		if (option.capital !== undefined && option.capital !== 'King Edward Point') {
			// создаем элемент option на странице HTML, который потом поместим в select
			const optionNode = document.createElement("option")

			// название Британии очень длинное и из-за этого весь select чересчур длинный
			// условием сокращаю название до более короткого
			if (option.name === 'United Kingdom of Great Britain and Northern Ireland') {
				optionNode.innerHTML = 'United Kingdom';
			} else {
				//запись  в текст - страны
				optionNode.innerHTML = option.name;
			}
			//запись в value - столицыы
			optionNode.value = option.capital;
			//добавление в select option'ы с странами и столицами
			select.appendChild(optionNode)
		}
	}
}

//? событие выбора страны
select.addEventListener('change', () => {
	//? отправляем в виджет выбранную страну(столицу)
	globalCapital = select.value;
	getWeather(select.value)
})



//функция получения api по столице и заполнения виджета данными о погоде
async function getWeather(capital) {
	// переменные для изменения фона виджета
	let Widget;
	let tempCount;

	// Встроенный объект который юзаем для отмены fetch
	let controller = new AbortController();

	// функция которая через 5 сек вызывает прерывание запроса
	setTimeout(() => {
		controller.abort()
	}, 5000)

	try {
		try {
			//получение api
			const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=fb876a71a8844bf7dbd7aa9a8080a2e9`, { signal: controller.signal }) //передаем сигнал (сигнал: значение сигнала)
			//преобразование полученных данных в объект
			const data = await response.json();
			console.log(data);
			//? присваивание HTML тегов к полученным объектам после получения данных
			Widget = document.querySelector('.weatherBlock');
			document.querySelector('.cityName').textContent = data.name;
			tempCount = document.querySelector('.temp__count').textContent = Math.round(data.main.temp - 273);
			document.querySelector('.temp__description').textContent = data.weather[0].description;
			document.querySelector('.weather__icon').innerHTML = `<img src = ./img/${data.weather[0].icon}@2x.png>`;
			document.querySelector('.temp__wind').innerHTML = data.wind.speed + ' м/c';
		}

		// если не выполняется запрос с 1 API то выполняем запрос с другой
		catch {
			const response = await fetch(`https://goweather.herokuapp.com/weather/${capital}`);
			const data = await response.json();

			//? присваивание HTML тегов к полученным объектам после получения данных
			Widget = document.querySelector('.weatherBlock');
			document.querySelector('.cityName').textContent = capital;

			var numberPattern = /\d+/g;

			tempCount = document.querySelector('.temp__count').textContent = Math.round(data.temperature.match(numberPattern));
			document.querySelector('.temp__description').textContent = data.description;
			document.querySelector('.weather__icon').innerHTML = `<img src = ./img/temperatureicon.png>`;
			let newWind = Math.round(data.wind.match(numberPattern) / 3.6);
			document.querySelector('.temp__wind').innerHTML = newWind + ' м/c';
		}

		//?изменение фона виджета в зависимости от температуры
		if (tempCount > 0 && tempCount <= 20) {
			Widget.classList.add('normal');
			Widget.classList.remove('cold', 'hot');
		}
		else if (tempCount < 0) {
			Widget.classList.add('cold');
			Widget.classList.remove('hot', 'normal');
		}
		else if (tempCount > 20) {
			Widget.classList.add('hot');
			Widget.classList.remove('cold', 'normal');
		}
		else {
			Widget.classList.remove('hot', 'cold', 'normal');
		}
	}

	//если произошла ошибка, то выводим:
	catch (error) {
		console.log(error);
		alert(error);
	}

}
