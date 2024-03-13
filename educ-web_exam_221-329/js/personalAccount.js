let api_key = "dbab3cbe-c086-47e4-9203-969f5117bb9a";

let currentRoutesResponseArray;
let currentGuidsResponseArray;
let currentRoute;
let selectedGuide;
let currentPrice = 0;

let currentOrdersArray;
let currentGuide;
let currentOrder;

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


function logJSON(json) {
    let fill = document.getElementById("fill");
    fill.innerText = "";
    let preElement = document.createElement("pre");
    preElement.textContent = JSON.stringify(json, null, 2);
    fill.appendChild(preElement);
}

function createModalButton(
    iconClass,
    modalId,
    routeId,
    guideId,
    orderId,
    listener
) {
    let button = document.createElement("button");
    button.type = "button";
    button.className = "btn p-1";
    button.setAttribute("data-bs-toggle", "modal");
    button.setAttribute("data-bs-target", "#" + modalId);

    let icon = document.createElement("i");
    icon.className = "bi " + iconClass;
    button.appendChild(icon);

    button.setAttribute("route-id", routeId);
    button.setAttribute("guide-id", guideId);
    button.setAttribute("order-id", orderId);
    button.addEventListener("click", listener);

    return button;
}

function fillOrderInfo() {
    for (let i = 0; i < currentOrdersArray.length; i++) {
        if (currentOrdersArray[i].id.toString() === currentOrder.toString()) {
            document.getElementById("dateValue").innerText =
                currentOrdersArray[i].date;
            document.getElementById("timeValue").innerText =
                currentOrdersArray[i].time;
            document.getElementById("priceValue").innerText =
                currentOrdersArray[i].price;
            document.getElementById("personCountValue").innerText =
                currentOrdersArray[i].persons;
            document.getElementById("durationValue").innerText =
                currentOrdersArray[i].duration;
            break;
        }
    }
}

function fillOrderInfoGuideTable() {
    for (let i = 0; i < currentGuidsResponseArray.length; i++) {
        if (
            currentGuidsResponseArray[i].id.toString() ===
            currentGuide.toString()
        ) {
            document.getElementById("guideNameValue").innerText =
                currentGuidsResponseArray[i].name;
            break;
        }
    }
    fillOrderInfo();
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
        fillOrderInfoGuideTable();
    };

    xhr.send();
}

function fillOrderTable(event) {
    currentRoute = event.currentTarget.getAttribute("route-id");
    currentGuide = event.currentTarget.getAttribute("guide-id");
    currentOrder = event.currentTarget.getAttribute("order-id");

    for (let i = 0; i < currentRoutesResponseArray.length; i++) {
        if (
            currentRoutesResponseArray[i].id.toString() ===
            currentRoute.toString()
        ) {
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

    getGuidsOnRoute(currentRoute);
}

function getOrders() {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        currentOrdersArray = this.response;
        fillOrdersTable();
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
            sendAlert("Успешно", "info", "mainAlert");
        } else {
            // eslint-disable-next-line max-len
            sendAlert(this.response.error.split(";").join("\n"), "danger", "mainAlert");
        }
        getOrders();
    };

    xhr.send(formData);
}

function detailedButtonClick(event) {
    document.getElementById("orderFields").style.display = "none";
    document.getElementById("getWithdraw").style.display = "none";

    fillOrderTable(event);
}

function editButtonClick(event) {
    document.getElementById("orderFields").style.display = "block";
    document.getElementById("getWithdraw").style.display = "block";

    fillOrderTable(event);
}

function trashButtonClick(event) {
    if (confirm("Удалить данный заказ?")) {
        deleteOrder(event.currentTarget.getAttribute("order-id"));
    }
}

function fillOrdersTable() {
    let tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = "";

    for (let i = 0; i < currentOrdersArray.length; i++) {
        let thisRoute = currentRoutesResponseArray.find(
            (obj) => obj.id === currentOrdersArray[i].route_id
        );

        let row = tbody.insertRow();

        let number = row.insertCell(0);
        number.innerText = (i + 1).toString();

        let id = row.insertCell(1);
        id.innerText = currentOrdersArray[i].id.toString();

        let name = row.insertCell(2);
        name.innerText = thisRoute.name;

        let date = row.insertCell(3);
        date.innerText = currentOrdersArray[i].date.toString();

        let price = row.insertCell(4);
        price.innerText = currentOrdersArray[i].price.toString();

        let buttons = row.insertCell(5);

        let detailsButton = createModalButton(
            "bi-eye-fill",
            "editModal",
            thisRoute.id,
            currentOrdersArray[i].guide_id,
            currentOrdersArray[i].id,
            detailedButtonClick
        );
        buttons.appendChild(detailsButton);

        let editButton = createModalButton(
            "bi-pencil-fill",
            "editModal",
            thisRoute.id,
            currentOrdersArray[i].guide_id,
            currentOrdersArray[i].id,
            editButtonClick
        );
        buttons.appendChild(editButton);

        let deleteButton = createModalButton(
            "bi-trash-fill",
            "deleteModal",
            thisRoute.id,
            currentOrdersArray[i].guide_id,
            currentOrdersArray[i].id,
            trashButtonClick
        );
        buttons.appendChild(deleteButton);
    }
}

function getRoutes() {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        currentRoutesResponseArray = this.response;
        if (xhr.status === 200) {
        }
        getOrders();
    };

    xhr.send();
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
    id,
    student_id = NaN
) {
    // eslint-disable-next-line max-len
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${id}?api_key=${api_key}`;
    // const url = "https://httpbin.org/put";

    let xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.responseType = "json";

    let formData = new FormData();

    formData.append("id", id.toString());
    formData.append("guide_id", guide_id.toString());
    formData.append("route_id", route_id.toString());
    formData.append("date", date.toString());
    formData.append("time", time.toString());
    formData.append("duration", duration.toString());
    formData.append("persons", persons.toString());
    formData.append("price", price.toString());
    formData.append("optionFirst", optionFirst.toString());
    formData.append("optionSecond", optionSecond.toString());
    formData.append("student_id", student_id.toString());

    xhr.onload = function () {
        if (xhr.status === 200) {
            sendAlert("Успешно", "info", "modalAlert");
        } else {
            // eslint-disable-next-line max-len
            sendAlert(this.response.error.split(";").join("\n"), "danger", "modalAlert");
        }
        getOrders();
    };

    xhr.send(formData);
}

function sendOrder() {
    let radioButtons = document.getElementsByName("radioGroup");
    let guide_id = currentGuide;

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
        currentOrder,
        student_id
    );
}

function orderFieldCheck() {
    let bool3 =
        new Date(document.getElementById("inputDate").valueAsNumber).setHours(
            0,
            0,
            0,
            0
        ) > new Date().setHours(0, 0, 0, 0);
    if (!bool3) {
        sendAlert(
            "Поле дата не может быть ранее или равна текущей",
            "danger",
            "modalAlert"
        );
    }

    let bool4 = document.getElementById("inputTime").value !== "";

    if (!bool4) {
        sendAlert("Время не может быть пустым", "danger", "modalAlert");
    }

    if (bool3 && bool4) {
        sendOrder();
    }
}

function createOption(content) {
    const option = document.createElement("option");
    option.value = content;
    option.text = content;
    return option;
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
        logJSON(this.response);
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
        logJSON(this.response);
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
            button.className = "btn btn-primary";
            button.setAttribute("data-bs-toggle", "modal");
            button.setAttribute("data-bs-target", "#exampleModal");
            button.textContent = "Подробнее...";
            button.setAttribute("route-id", currentRoutesResponseArray[i].id);
            button.addEventListener("click", editButtonClick);
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

function slideTable(ident) {
    currentPage += ident;

    updatePagination(currentPage);
    fillRoutesTable();
}

function isTimeInRange(timeString, timeFrom, timeTo) {
    let [hours, minutes] = timeString.split(":");

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    return hours >= timeFrom && hours < timeTo && minutes >= 0 && minutes < 60;
}

function calculatePrice() {
    for (let i = 0; i < currentGuidsResponseArray.length; i++) {
        if (
            currentGuidsResponseArray[i].id.toString() ===
            currentGuide.toString()
        ) {
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
    //


    document
        .getElementById("getWithdraw")
        .addEventListener("click", function () {
            sendOrder();
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
};
