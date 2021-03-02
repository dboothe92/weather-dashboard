let searchButtonEl = document.querySelector("#searchButton");
let cityHeaderEl = document.querySelector("#cityHeader");
let historyHolderEl = document.querySelector("#historyHolder");
let forecastContainer = document.querySelector("#forecastContainer");
let tempEl = document.querySelector("#temp");
let humidityEl = document.querySelector("#humidity");
let windEl = document.querySelector("#windSpeed");
let uvIndex = document.querySelector("#uvIndex");

//holds searched city to be stored in local storage
let citiesHistory = []

//Searches for city and displays info
function searchButton(event) {
    event.preventDefault();

    //Gets user input
    let cityNameEl = document.querySelector("#searchInput").value

    //getting daily info from weather api
    fetch('https://api.openweathermap.org/data/2.5/weather?q='
    + cityNameEl +
    '&appid=80b6d305e4d5ca9652f4c79da036c1a3&units=imperial')
    .then(function(dayResponse) {
        if (dayResponse.ok) {
            dayResponse.json()
            .then(function(dayResponse) {
                //Info for detail header
                let cityDetailsEl = document.querySelector("#cityDetails");
                cityDetailsEl.removeAttribute("class", ".hide");
                let timeOnClick = dayjs().format("M/D/YYYY");

                citiesHistory.push(cityNameEl);
                console.log(citiesHistory);

                saveHistory();

                //resets history buttons
                resetHistory();

                let currentTemp = Math.round(dayResponse.main.temp) + " °F";
                let currentHumidity = dayResponse.main.humidity + "%";
                let currentWindSpeed = dayResponse.wind.speed + " MPH";
                let singleWeatherIcon = dayResponse.weather[0].icon;
        
                let lat = dayResponse.coord.lat;
                let lon = dayResponse.coord.lon;
        
                cityHeaderEl.innerHTML = (cityNameEl + " " + timeOnClick + " " + ("<img src=http://openweathermap.org/img/wn/" + singleWeatherIcon + "@2x.png>")); 
        
                //getting uvi
                fetch('https://api.openweathermap.org/data/2.5/onecall?lat='+ lat + '&lon=' + lon + '&exclude=daily,hourly,minutely&appid=80b6d305e4d5ca9652f4c79da036c1a3&units=imperial')
                .then(function(uvResponse) {
                    return uvResponse.json();
                })
                .then(function(uvResponse) {
                    let uvi = uvResponse.current.uvi;
                    uvIndex.textContent = uvi;
                });
        
                //have daily info show on screen
                tempEl.textContent = currentTemp;
                humidityEl.textContent = currentHumidity;
                windEl.textContent = currentWindSpeed;

                //log search term into history
                for (i = 0; i < citiesHistory.length; i++) {
                    let searchHistory = document.createElement("li");
                    searchHistory.setAttribute("class","list-group-item");
                    searchHistory.innerHTML = "<button  type=submit class = list-group-item>" + citiesHistory[i] + "</button>"
            
                    historyHolderEl.appendChild(searchHistory);
                };
            });
        
            //getting 5 day forecast
            fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + cityNameEl + '&appid=80b6d305e4d5ca9652f4c79da036c1a3&units=imperial')
            .then(function(forecastResponse) {
                return forecastResponse.json();
            })
            .then(function(forecastResponse) {
                resetForecast();
        
                //Separates Day from hourly breakdown
                let dayCounter = 1
        
                //function to create cards for 5 day forecast
                function weatherCards() {
                    let colDiv = document.createElement("div");
                    colDiv.setAttribute('class', 'col-2')
        
                    let cardDiv = document.createElement("div");
                    cardDiv.setAttribute('class', 'card');
        
                    let cardBody = document.createElement("div");
                    cardBody.setAttribute('class', 'card-body bg-primary rounded');
        
                    let cardDate = document.createElement("h5");
                    cardDate.setAttribute('class', 'card-title text-white');
                    cardDate.innerHTML = "<span id = 'cardDate" + dayCounter +"'></span>"
        
                    let cardIcon = document.createElement("p");
                    cardIcon.setAttribute("id", "cardIcon" + dayCounter);
        
                    let cardTemp = document.createElement("h6");
                    cardTemp.setAttribute("class", "card-subtitle mb-3 text-white");
                    cardTemp.innerHTML = "Temp: <span id = 'cardTemp" + dayCounter + "'></span>";
                    
                    let cardHumidity = document.createElement("h6");
                    cardHumidity.setAttribute("class", "card-subtitle mb-2 text-white");
                    cardHumidity.innerHTML = "Humidity: <span id = 'cardHumidity" + dayCounter + "'></span>";
        
                    //append created elements to document. 
                    cardBody.appendChild(cardDate);
                    cardBody.appendChild(cardIcon);
                    cardBody.appendChild(cardTemp);
                    cardBody.appendChild(cardHumidity);
                    cardDiv.appendChild(cardBody);
                    colDiv.appendChild(cardDiv);
                    forecastContainer.appendChild(colDiv);  
                };
                
                //gets data for forecast cards
                for (i=0; i < forecastResponse.list.length; i++) {
                    let futureDay = (dayjs().add(dayCounter, 'day').format("YYYY-MM-DD") + " 00:00:00");
                    let forecastDate = forecastResponse.list[i].dt_txt;
                    let forecastTemp = Math.round(forecastResponse.list[i].main.temp) + ' °F';
                    let forecastHumidity = forecastResponse.list[i].main.humidity + '%';
                    
                    if (forecastDate === futureDay) {
                        futureDay = dayjs().add(dayCounter, 'day').format("MM/DD/YYYY");
                        let forecastIcon = forecastResponse.list[i].weather[0].icon;
                        
                        //makes a card for each day in 5 day forecast
                        weatherCards();
                        
                        //fills cards in with data
                        document.querySelector("#cardDate" + dayCounter).textContent = futureDay
                        document.querySelector("#cardTemp" + dayCounter).textContent = forecastTemp
                        document.querySelector("#cardHumidity" + dayCounter).textContent = forecastHumidity
                        document.querySelector("#cardIcon" + dayCounter).innerHTML = "<img src=http://openweathermap.org/img/wn/" + forecastIcon + "@2x.png>";
                        dayCounter++;
                    }
                };
            });
        } else {
            alert("Error: " + dayResponse.status);
            return;
        };
    })
};

//Function to reset History Buttons
function resetHistory() {
    while(historyHolderEl.firstChild) {
        historyHolderEl.removeChild(historyHolderEl.firstChild);
        dayCounter = 1
    }
};

//Resets forecast container
function resetForecast() {
    while(forecastContainer.firstChild) {
        forecastContainer.removeChild(forecastContainer.firstChild);
    }
};

function saveHistory() {
    localStorage.setItem("History", JSON.stringify(citiesHistory));
}

searchButtonEl.addEventListener("click", searchButton);
