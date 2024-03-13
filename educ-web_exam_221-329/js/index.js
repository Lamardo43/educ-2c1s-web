let api_key = "dbab3cbe-c086-47e4-9203-969f5117bb9a";

let currentRoutesResponseArray;
let currentGuidsResponseArray;
let currentRoute;
let selectedGuide;
let currentPrice = 0;

const rowsPerPage = 4;
let currentPage = 0;
let totalCount = 0;

const substringLength = 80;

const DayOff = [
    "01-01",
    "01-02",
    "01-03",
    "01-04",
    "01-05",
    "01-06",
    "01-07",
    "01-08",
    "02-23",
    "03-08",
    "04-29",
    "04-30",
    "05-01",
    "05-09",
    "05-10",
    "06-12",
    "11-04",
    "12-30",
    "12-31",
];

//
// function withdrawButtonClick(event) {
//     let fio = document.getElementById("inputFIO").value;
// }

function logJSON(json) {
    let fill = document.getElementById("fill");
    fill.innerText = "";
    let preElement = document.createElement("pre");
    preElement.textContent = JSON.stringify(json, null, 2);
    fill.appendChild(preElement);
}

function isTimeInRange(timeString, timeFrom, timeTo) {
    let [hours, minutes] = timeString.split(":");

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    return hours >= timeFrom && hours < timeTo && minutes >= 0 && minutes < 60;
}

function calculatePrice() {
    for (let i = 0; i < currentGuidsResponseArray.length; i++) {
        if (currentGuidsResponseArray[i].id === selectedGuide) {
            let hoursNumber = document.getElementById("selectorDuration").value;
            let guideServiceCost = currentGuidsResponseArray[i].pricePerHour;
            let curr_date = document.getElementById("inputDate").value;
            let isThisDayOff =
                [0, 6].includes(new Date(curr_date).getDay()) ||
                DayOff.some((substring) =>
                    curr_date.toString().includes(substring)
                )
                    ? 1.5
                    : 1;
            let isItMorning = isTimeInRange(
                document.getElementById("inputTime").value,
                9,
                12
            )
                ? 400
                : 0;
            let isItEvening = isTimeInRange(
                document.getElementById("inputTime").value,
                20,
                23
            )
                ? 1000
                : 0;

            let countOfVisitors = document.getElementById(
                "selectorPersonCount"
            ).value;
            let numberOfVisitors;

            if (countOfVisitors <= 5) {
                numberOfVisitors = 0;
            } else if (countOfVisitors > 5 && countOfVisitors <= 10) {
                numberOfVisitors = 1000;
            } else {
                numberOfVisitors = 1500;
            }

            let price =
                guideServiceCost * hoursNumber * isThisDayOff +
                isItMorning +
                isItEvening +
                numberOfVisitors;

            if (document.getElementById("checkboxOption1").checked) {
                price *= 0.85;
            }

            if (document.getElementById("checkboxOption2").checked) {
                price += countOfVisitors * 1000;
            }

            document.getElementById("totalPrice").innerText =
                Math.ceil(price).toString();
            currentPrice = Math.ceil(price);

            break;
        }
    }
}

function fillGuidsTable() {
    let tbody = document.getElementById("guidesBody");
    tbody.innerHTML = "";

    for (let i = 0; i < currentGuidsResponseArray.length; i++) {
        let row = tbody.insertRow();

        let cellRadio = row.insertCell(0);
        let radiobutton = document.createElement("input");
        radiobutton.type = "radio";
        radiobutton.name = "radioGroup";
        radiobutton.id = currentGuidsResponseArray[i].id.toString();
        radiobutton.addEventListener("click", function () {
            selectedGuide = currentGuidsResponseArray[i].id;
            calculatePrice();
        });
        cellRadio.appendChild(radiobutton);

        let id = row.insertCell(1);
        id.innerText = currentGuidsResponseArray[i].id.toString();

        let language = row.insertCell(2);
        language.innerText = currentGuidsResponseArray[i].language.toString();

        let name = row.insertCell(3);
        name.innerText = currentGuidsResponseArray[i].name.toString();

        let pricePerHour = row.insertCell(4);
        pricePerHour.innerText =
            currentGuidsResponseArray[i].pricePerHour.toString();

        let workExperience = row.insertCell(5);
        workExperience.innerText =
            currentGuidsResponseArray[i].workExperience.toString();
    }
}

function createOption(content, value) {
    const option = document.createElement("option");
    option.value = value;
    option.text = content;
    return option;
}

function sendAlert(message, type, id) {
    let alertContainer = document.getElementById(id);
    let alertDiv = document.createElement("div");
    alertDiv.classList.add(
        "alert",
        `alert-${type}`,
        "alert-dismissible",
        "m-0",
        "my-2"
    );
    alertDiv.innerText = message;
    alertContainer.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

function getGuidsOnRoute(routeId) {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    let languageSet = new Set();

    xhr.onload = function () {
        currentGuidsResponseArray = this.response;
        fillGuidsTable();

        for (let i = 0; i < currentGuidsResponseArray.length; i++) {
            languageSet.add(currentGuidsResponseArray[i].language);
        }

        languageSet.forEach((language) => {
            document
                .getElementById("selectorGuideLanguage")
                .appendChild(createOption(language, language));
        });
    };

    xhr.send();
}

function detailedButtonClick(event) {
    let id_n = event.target.getAttribute("route-id");

    currentRoute = id_n;

    for (let i = 0; i < currentRoutesResponseArray.length; i++) {
        if (currentRoutesResponseArray[i].id.toString() === id_n) {
            document.getElementById("IDValue").innerText =
                currentRoutesResponseArray[i].id;
            document.getElementById("nameValue").innerText =
                currentRoutesResponseArray[i].name;
            document.getElementById("discrValue").innerText =
                currentRoutesResponseArray[i].description;
            document.getElementById("placesValue").innerText =
                currentRoutesResponseArray[i].mainObject;
            break;
        }
    }
    getGuidsOnRoute(id_n);
}

function fillRoutesTable() {
    let tbody = document.getElementById("routesBody");
    tbody.innerHTML = "";

    for (
        let i = (currentPage - 1) * rowsPerPage;
        i < currentPage * rowsPerPage;
        i++
    ) {
        if (i < totalCount) {
            let row = tbody.insertRow();

            let id = row.insertCell(0);
            id.innerText = currentRoutesResponseArray[i].id
                .toString()
                .substring(0, substringLength);

            let name = row.insertCell(1);
            name.innerText = currentRoutesResponseArray[i].name
                .toString()
                .substring(0, substringLength);

            let discr = row.insertCell(2);
            discr.innerText = currentRoutesResponseArray[i].description
                .toString()
                .substring(0, substringLength);

            let objects = row.insertCell(3);
            objects.innerText = currentRoutesResponseArray[i].mainObject
                .toString()
                .substring(0, substringLength);

            let buttons = row.insertCell(4);
            let button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-warning";
            button.setAttribute("data-bs-toggle", "modal");
            button.setAttribute("data-bs-target", "#exampleModal");
            button.textContent = "Подробнее...";
            button.setAttribute("route-id", currentRoutesResponseArray[i].id);
            button.addEventListener("click", detailedButtonClick);
            buttons.appendChild(button);
        }
    }
}

function updatePagination(value) {
    currentPage = value;
    totalCount = currentRoutesResponseArray.length;

    let bool1 = currentPage >= Math.ceil(totalCount / rowsPerPage);
    let bool2 = currentPage === 1;

    document.getElementById("next").disabled = bool1;

    document.getElementById("prev").disabled = bool2;

    document.getElementById("current-interval-start").innerText = currentPage;
    document.getElementById("current-interval-end").innerText = Math.ceil(
        totalCount / rowsPerPage
    );
}

function getObjectNames(str) {
    const regex = /«([^»]*)»/g;
    const matches = new Set();
    let match;

    while ((match = regex.exec(str)) !== null) {
        matches.add(match[1]);
    }

    return matches;

}

function fillRouteFilterOptions() {
    let selectElement = document.getElementById("selectorPlace");
    selectElement.innerHTML = "";
    const uniqueNames = new Set();
    selectElement.appendChild(createOption("Выберите объект", "notSearch"));
    currentRoutesResponseArray.forEach((route) => {
        const names = getObjectNames(route.mainObject);
        names.forEach((name) => {
            if (!uniqueNames.has(name)) {
                selectElement.appendChild(createOption(name, name));
                uniqueNames.add(name);
            }
        });
    });
}

function getRoutes() {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.send();

    xhr.onload = function () {
        currentRoutesResponseArray = this.response;
        updatePagination(1);
        fillRoutesTable();
        fillRouteFilterOptions();
    };
}

function addOrder(
    guide_id,
    route_id,
    date,
    time,
    duration,
    persons,
    price,
    optionFirst,
    optionSecond,
    student_id = NaN,
    id = NaN
) {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";

    let formData = new FormData();

    formData.append("id", id);
    formData.append("guide_id", guide_id);
    formData.append("route_id", route_id);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("duration", duration);
    formData.append("persons", persons);
    formData.append("price", price);
    formData.append("optionFirst", optionFirst);
    formData.append("optionSecond", optionSecond);
    formData.append("student_id", student_id);

    xhr.onload = function () {
        if (xhr.status === 200) {
            sendAlert("Успешно", "info", "modalAlert");
        } else {
            // eslint-disable-next-line max-len
            sendAlert(this.response.error.split(";").join("\n"), "danger", "modalAlert");
        }
    };

    xhr.send(formData);
}

function sendOrder() {
    let radioButtons = document.getElementsByName("radioGroup");
    let guide_id;
    for (let i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            guide_id = radioButtons[i].id;
            break;
        }
    }

    let route_id = currentRoute;

    let date = document.getElementById("inputDate").value;

    let time = document.getElementById("inputTime").value;

    let price = currentPrice;

    let duration = document.getElementById("selectorDuration").value;

    let persons = document.getElementById("selectorPersonCount").value;

    let optionFirst = document.getElementById("checkboxOption1").checked;

    let optionSecond = document.getElementById("checkboxOption2").checked;

    let student_id = document.getElementById("inputStudId").value;

    addOrder(
        guide_id,
        route_id,
        date,
        time,
        duration,
        persons,
        price,
        optionFirst,
        optionSecond,
        student_id
    );
}

function getOrders() {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
    };

    xhr.send();
}

function deleteOrder(id) {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${id}?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.responseType = "json";

    let formData = new FormData();
    formData.append("id", id.toString());

    xhr.onload = function () {
        if (xhr.status === 200) {
            sendAlert("Успешно", "info", "modalAlert");
        } else {
            // eslint-disable-next-line max-len
            sendAlert(this.response.error.split(";").join("\n"), "danger", "modalAlert");
        }
    };

    xhr.send(formData);
}

function getOrder(id) {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${id}?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    let formData = new FormData();

    formData.append("id", id.toString());

    xhr.onload = function () {
    };

    xhr.send(formData);
}

function getGuide(guide_id) {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/${guide_id}?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    let formData = new FormData();
    formData.append("id", guide_id.toString());

    xhr.onload = function () {
    };

    xhr.send(formData);
}

function deleteAllOrders() {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        for (let i = 0; i < this.response.length; i++) {
            deleteOrder(this.response[i].id);
        }
    };

    xhr.send();
}

function slideTable(ident) {
    currentPage += ident;

    updatePagination(currentPage);
    fillRoutesTable();
}

function applyRouteSearchFilters() {
    let place = document
        .getElementById("selectorPlace")
        .value.toLowerCase()
        .trim();
    let name = document.getElementById("inputName").value.toLowerCase().trim();

    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        if (place === "notsearch" && name.length === 0) {
            currentRoutesResponseArray = this.response;
        } else {
            currentRoutesResponseArray = this.response.filter((route) => {
                return (
                    (route.name.toLowerCase().includes(name) ||
                        name.length === 0) &&
                    (route.mainObject.toLowerCase().includes(place) ||
                        place === "notsearch")
                );
            });
        }
        updatePagination(1);
        fillRoutesTable();
    };

    xhr.send();
}

function applyGuideLanguageFilters() {
    let language = document
        .getElementById("selectorGuideLanguage")
        .value.toLowerCase()
        .trim();
    let expF = parseInt(
        document.getElementById("inputExperienceFrom").value.trim()
    );
    let expT = parseInt(
        document.getElementById("inputExperienceTo").value.trim()
    );
    console.log(isNaN(expT));

    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${currentRoute}/guides?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        if (language === "notguidesearch" && isNaN(expF) && isNaN(expT)) {
            currentGuidsResponseArray = this.response;
        } else {
            currentGuidsResponseArray = this.response.filter((guide) => {
                return (
                    (language === "notguidesearch" ||
                        guide.language.toLowerCase() === language) &&
                    (isNaN(expF) || parseInt(guide.workExperience) >= expF) &&
                    (isNaN(expT) || parseInt(guide.workExperience) <= expT)
                );
            });
        }
        fillGuidsTable();
    };

    xhr.send();
}

window.onload = function () {
    // loadPage(0);
    getRoutes();

    document.getElementById("inputName").addEventListener("input", function () {
        applyRouteSearchFilters();
    });
    document
        .getElementById("inputExperienceFrom")
        .addEventListener("input", function () {
            applyGuideLanguageFilters();
        });
    document
        .getElementById("inputExperienceTo")
        .addEventListener("input", function () {
            applyGuideLanguageFilters();
        });

    document
        .getElementById("getWithdraw")
        .addEventListener("click", function () {
            sendOrder();
        });
    document.getElementById("prev").addEventListener("click", function () {
        slideTable(-1);
    });

    document.getElementById("next").addEventListener("click", function () {
        slideTable(1);
    });
    document
        .getElementById("selectorPlace")
        .addEventListener("change", function () {
            applyRouteSearchFilters();
        });
    document
        .getElementById("selectorGuideLanguage")
        .addEventListener("change", function () {
            applyGuideLanguageFilters();
        });

    document
        .getElementById("inputTime")
        .addEventListener("change", function () {
            calculatePrice();
        });
    document
        .getElementById("inputDate")
        .addEventListener("change", function () {
            calculatePrice();
        });
    document
        .getElementById("selectorPersonCount")
        .addEventListener("change", function () {
            calculatePrice();
        });
    document
        .getElementById("selectorDuration")
        .addEventListener("change", function () {
            calculatePrice();
        });
    document
        .getElementById("checkboxOption1")
        .addEventListener("click", function () {
            calculatePrice();
        });
    document
        .getElementById("checkboxOption2")
        .addEventListener("click", function () {
            calculatePrice();
        });

    const map = new mapgl.Map('GISContainer', {
        center: [55.31878, 25.23584],
        zoom: 13,
        key: 'cbce5dad-b2c6-42b9-99a0-dadffa9a1446',
        style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b'
    });
    const marker = new mapgl.Marker(map, {
        coordinates: [55.31878, 25.23584],
    });
};
