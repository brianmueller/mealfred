$(function () {
  let urlParams = new URLSearchParams(window.location.search);
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  let baseURL = "https://json.extendsclass.com/bin/"
  let queueID = getUrlParameter("queueID");
  let calendarID = getUrlParameter("calendarID");
  let catalogID = getUrlParameter("catalogID");
  let apiKey = getUrlParameter("apiKey");

  function loading() {
    document.querySelector("#loading").style.display = "block";
  }

  function loaded() {
    document.querySelector("#loading").style.display = "none";
  }

  async function read(id){
    const response = await fetch(baseURL+id);
    const data = await response.json();
    return data;
  }

  async function write(id,newJson){
    fetch(baseURL + id, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify( newJson ),
    }).then(function (response) {
    });
  }

  function findRecipeIndex(catalog,title){
    let index = -1;
    for(let i = 0; i < catalog.length; i++){
      if(catalog[i].title == title){
        return i;
      }
    }
    return index;
  }

  /******************* QUEUE *******************/

  let queueArr = [""];
  let mealIndex = 0;
  let mealText = "";
  let source = "manual"; // source of calendar meal


  /******************* NOTE TO SELF *******************/
  // I refactored the showQueue() function to use read() and write(), but then other functions below worked just fine, so I didn't refactor those (yet).

  async function showQueue() {
    loading();
    // const data = await fetch(baseURL + queueID).then(function (response) {
    //   loaded();
    //   return response.json();
    // });

    read(queueID).then(data => {
      loaded();
      if (data.queue != null) {
        queueArr = data.queue;
        let queueUl = document.querySelector("#queue ul");
        for (let i = 1; i < data.queue.length; i++) {
          let meal = data.queue[i];
          queueUl.innerHTML +=
            "<li><span>" +
            meal +
            "</span> <img src='calendar-icon.png' class='schedule'><img src='trash-icon.png' class='deleteQueueItem'></li>";
        }
      }

      queuesListenForSchedule();
      queuesListenForDelete();
      
    });
  }
  showQueue();

  // add to queue

  function addToQueue(meal) {
    // front end
    let queueUl = document.querySelector("#queue ul");
    queueUl.innerHTML +=
      "<li><span>" +
      meal +
      "</span> <img src='calendar-icon.png' class='schedule'><img src='trash-icon.png' class='deleteQueueItem'></li>";

    queuesListenForSchedule();
    queuesListenForDelete();

    // back end
    addToQueueJSON(meal);
  }

  // user text
  document.querySelector("#plusQueue").addEventListener("click", function () {
    let userMeal = prompt("Please enter the meal:");
    if (userMeal == null) {
    } else if (userMeal == "") {
      alert("Meal cannot be blank");
    } else {
      addToQueue(userMeal);
    }
  });

  // from catalog
  function catalogListenForPlus() {
    let allCatalogPlus = document.getElementsByClassName("catalogPlus");

    Array.from(allCatalogPlus).forEach(function (element) {
      element.addEventListener("click", function () {
        let catalogMeal = this.parentElement.childNodes[1].childNodes[1]
          .childNodes[1].firstChild.innerHTML;
        addToQueue(catalogMeal);
        this.src = "plus-icon-blue.png";
      });
    });
  }

  async function loadRecipeToEdit(title) {
    loading();
    const jsonStore = await fetch(baseURL + catalogID).then(function (
      response
    ) {
      loaded();
      return response.json();
    });

    catalogHash = jsonStore.catalog;
    let mealIndex = findRecipeIndex(catalogHash,title)
    let mealToEdit = catalogHash[mealIndex];
    console.log("mealIndex: " + mealIndex);
    console.log("mealToEdit: " + mealToEdit);

    newRecipeTitle.value = mealToEdit.title;
    newRecipeNotes.value = mealToEdit.notes;
    newRecipeTags.value = mealToEdit.tags;
    newRecipeLink.value = mealToEdit.link;
    newRecipePhotoUrl.value = mealToEdit.photoUrl;
    newRecipePhotoImg.value = mealToEdit.photoImg;
    newRecipeId.value = mealIndex;
    
    // let newRecipeNotes = document.querySelector("#newRecipeNotes");
    // let newRecipeTags = document.querySelector("#newRecipeTags");
    // let newRecipeLink = document.querySelector("#newRecipeLink");
    // let newRecipePhotoUrl = document.querySelector("#newRecipePhotoUrl");
    // let newRecipePhotoImg = document.querySelector("#newRecipePhotoImg");
    // let newRecipePhotoId = document.querySelector("#newRecipeId");
    document.getElementById('newRecipe').scrollIntoView();
  }
  
  // catalog edit
  function catalogListenForEdit() {
    let allCatalogEdit = document.getElementsByClassName("catalogEdit");

    Array.from(allCatalogEdit).forEach(function (element) {
      element.addEventListener("click", function () {
        // let catalogMealId = this.parentElement.childNodes[1].childNodes[3].id;
        // catalogMealId = parseInt(catalogMealId.substring(6)); // turn recipe4 into 4
        let catalogMealTitle = this.parentElement.childNodes[1].childNodes[1].childNodes[1].childNodes[0].innerText;
        loadRecipeToEdit(catalogMealTitle);
      });
    });
  }
  catalogListenForEdit();

  async function addToQueueJSON(meal) {
    loading();
    const jsonStore = await fetch(baseURL + queueID).then(function (response) {
      return response.json();
    });

    queueArr = jsonStore.queue;
    if (jsonStore.queue == null) {
      queueArr = ["", meal];
    } else {
      queueArr.push(meal);
    }
    loading();
    fetch(baseURL + queueID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ queue: queueArr }),
    }).then(function (response) {
      loaded();
    });
  }

  // clear queue

  document.querySelector("#clearQueue").addEventListener("click", function () {
    let clearQueueConfirm = confirm(
      "Are you sure you want to clear the queue?"
    );
    if (clearQueueConfirm) {
      // front end
      document.querySelector("#queue ul").innerHTML = "";

      // back end
      clearQueue();
    }
  });

  function clearQueue() {
    loading();
    fetch(baseURL + queueID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ queue: [""] }),
    }).then(function (response) {
      loaded();
    });
  }

  // delete item from queue

  function deletefromQueue(mealT) {
    mealI = queueArr.indexOf(mealT);
    queueArr.splice(mealI, 1);
    loading();
    fetch(baseURL + queueID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ queue: queueArr }),
    }).then(function (response) {
      loaded();
    });
  }

  function queuesListenForDelete() {
    let queues = document.getElementsByClassName("deleteQueueItem");

    Array.from(queues).forEach(function (element) {
      element.addEventListener("click", function () {
        // front end
        this.parentElement.remove();

        // back end
        let mealText = this.parentElement.firstChild.innerHTML;
        deletefromQueue(mealText);
      });
    });
  }

  function calendarMealsListenForQueue() {
    let calMeals = document.getElementsByClassName("queueCalendarMeal");
    Array.from(calMeals).forEach(function (element) {
      element.addEventListener("click", function () {
        let meal = this.parentElement.childNodes[0].innerText;
        let type = "meal";
        let day = this.parentElement.parentElement.parentElement.parentElement
          .childNodes[1].innerText;
        addToQueue(meal);
        removeFromCalendar(type, day, meal);
        this.parentElement.remove();
      });
    });
  }

  function calendarMealsListenForReschedule() {
    let calMeals = document.getElementsByClassName("reschedule");

    Array.from(calMeals).forEach(function (element) {
      element.addEventListener("click", function () {
        // front end
        source = "calendar";
        mealText = this.parentElement.childNodes[0].innerText;
        $("#scheduler").css("display", "block");

        let rescheduleOldDay = this.parentElement.parentElement.parentElement
          .parentElement.childNodes[1].innerText;
        // console.log(rescheduleOldDay);
        // console.log(mealText);
        removeFromCalendar("meal", rescheduleOldDay, mealText);

        this.parentElement.remove();
      });
    });
  }

  function calendarMealsListenForDelete() {
    let calendarMeals = document.getElementsByClassName("deleteCalendarMeal");
    Array.from(calendarMeals).forEach(function (element) {
      element.addEventListener("click", function () {
        // back end
        let mealDay = this.parentElement.parentElement.parentElement
          .parentElement.childNodes[1].innerText;
        let mealText = this.parentElement.childNodes[0].innerText;
        removeFromCalendar("meal", mealDay, mealText);

        // front end
        this.parentElement.remove();
      });
    });
  }

  function calendarEventsListenForDelete() {
    let calendarEvents = document.getElementsByClassName("deleteCalendarEvent");
    Array.from(calendarEvents).forEach(function (element) {
      element.addEventListener("click", function () {
        // back end
        let eventDay = this.parentElement.parentElement.parentElement
          .parentElement.childNodes[1].innerText;
        let eventText = this.parentElement.childNodes[0].innerText;
        removeFromCalendar("event", eventDay, eventText);

        // front end
        this.parentElement.remove();
      });
    });
  }

  async function removeFromCalendar(type, day, name) {
    // type = "meal" or "event"
    loading();
    const jsonStore = await fetch(baseURL + calendarID).then(function (
      response
    ) {
      return response.json();
    });
    calendarHash = jsonStore.calendar;
    itemIndex = calendarHash[day][type + "s"].indexOf(name);
    calendarHash[day][type + "s"].splice(itemIndex, 1);
    fetch(baseURL + calendarID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ calendar: calendarHash }),
    }).then(function (response) {
      loaded();
    });
  }

  // schedule

  function queuesListenForSchedule() {
    let queues = document.getElementsByClassName("schedule");

    Array.from(queues).forEach(function (element) {
      element.addEventListener("click", function () {
        // front end
        source = "queue";
        mealText = this.parentElement.childNodes[0].innerText;
        $("#scheduler").css("display", "block");
        this.parentElement.remove();
      });
    });
  }

  function scheduler() {
    let schedulerDays = document.getElementsByClassName("schedulerDay");
    Array.from(schedulerDays).forEach(function (day) {
      day.addEventListener("click", function () {
        let dayText = this.innerText;
        scheduleMealFront(dayText, mealText);
        scheduleMealBack(dayText, mealText, source); // source is either "queue","calendar", or "manual"
        $("#scheduler").css("display", "none");
      });
    });
  }
  scheduler(false);

  function scheduleMealFront(day, meal) {
    let targetDay = document.querySelector("#" + day.toLowerCase());
    targetDay.childNodes[3].childNodes[1].innerHTML += `<li><span>${meal}</span> <br><img src="queue-icon.png" class="queueCalendarMeal"> <img src='calendar-icon.png' class='reschedule'> <img src='trash-icon.png' class='deleteCalendarMeal'></li>`;

    calendarMealsListenForQueue();
    calendarMealsListenForReschedule();
    calendarMealsListenForDelete();
  }

  async function scheduleMealBack(day, meal, source) {
    // source: "queue", "calendar", "manual"
    loading();
    const jsonStore = await fetch(baseURL + calendarID).then(function (
      response
    ) {
      return response.json();
    });

    calendarHash = jsonStore.calendar;
    calendarHash[day].meals.push(meal);

    fetch(baseURL + calendarID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ calendar: calendarHash }),
    }).then(function (response) {
      loaded();
    });

    if (source == "queue") {
      deletefromQueue(meal);
    }
  }

  /******************* END QUEUE *******************/

  /******************* CALENDAR *******************/

  var calendarHash = {};

  async function showCalendar() {
    loading();
    const jsonStore = await fetch(baseURL + calendarID).then(function (
      response
    ) {
      loaded();
      return response.json();
    });

    if (jsonStore.calendar != null) {
      calendarHash = jsonStore.calendar;
      let calendarBody = document.querySelector("#calendar tbody");

      calendarBody.childNodes.forEach(function (trDay) {
        if (trDay.nodeName == "TR") {
          let day = trDay.children[0].innerText;
          let meals = calendarHash[day]["meals"];
          for (let i = 1; i < meals.length; i++) {
            trDay.childNodes[3].childNodes[1].innerHTML += `<li><span>${meals[i]}</span> <br><img src="queue-icon.png" class="queueCalendarMeal"> <img src='calendar-icon.png' class='reschedule'> <img src='trash-icon.png' class='deleteCalendarMeal'></li>`;
          }
          let events = calendarHash[day]["events"];
          for (let i = 1; i < events.length; i++) {
            trDay.childNodes[5].childNodes[1].innerHTML += `<li><span>${events[i]}</span> <br><img src='trash-icon.png' class='deleteCalendarEvent'></li>`;
          }
        }
      });
    }

    calendarMealsListenForQueue();
    calendarMealsListenForReschedule();
    calendarMealsListenForDelete();
    calendarEventsListenForDelete();
  }
  showCalendar();

  // user meals

  function calendarListenForPlusMeals() {
    let allMealsPlus = document.getElementsByClassName("plusMeal");

    Array.from(allMealsPlus).forEach(function (element) {
      element.addEventListener("click", function () {
        let userDay = this.parentElement.parentElement.childNodes[1].innerText;
        let userMeal = prompt("Please enter the meal:");
        if (userMeal == null) {
        } else if (userMeal == "") {
          alert("Meal cannot be blank");
        } else {
          scheduleMealFront(userDay, userMeal);
          scheduleMealBack(userDay, userMeal);
        }
      });
    });
  }
  calendarListenForPlusMeals();

  // user events

  function calendarListenForPlusEvents() {
    let allEventsPlus = document.getElementsByClassName("plusEvent");

    Array.from(allEventsPlus).forEach(function (element) {
      element.addEventListener("click", function () {
        let userDay = this.parentElement.parentElement.childNodes[1].innerText;
        let userEvent = prompt("Please enter the event:");
        if (userEvent == null) {
        } else if (userEvent == "") {
          alert("Event cannot be blank");
        } else {
          scheduleEventFront(userDay, userEvent);
          scheduleEventBack(userDay, userEvent);
        }
      });
    });
  }
  calendarListenForPlusEvents();

  function scheduleEventFront(day, event) {
    let targetDay = document.querySelector("#" + day.toLowerCase());
    targetDay.childNodes[5].childNodes[1].innerHTML += `<li><span>${event}</span> <br><img src='trash-icon.png' class='deleteCalendarEvent'></li>`;

    calendarEventsListenForDelete();
  }

  async function scheduleEventBack(day, event) {
    loading();
    // const jsonStore = await fetch(baseURL+'calendar/'+day+'/events')
    const jsonStore = await fetch(baseURL + calendarID).then(function (
      response
    ) {
      return response.json();
    });

    calendarHash = jsonStore.calendar;
    calendarHash[day].events.push(event);

    fetch(baseURL + calendarID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ calendar: calendarHash }),
    }).then(function (response) {
      loaded();
    });
  }

  // clear calendar

  document
    .querySelector("#clearCalendar")
    .addEventListener("click", function () {
      let clearCalendarConfirm = confirm(
        "Are you sure you want to clear the calendar?"
      );
      if (clearCalendarConfirm) clearCalendar();
    });

  function clearCalendar() {
    // front end
    let calendarBody = document.querySelector("#calendar tbody");
    let days = [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];
    calendarBody.childNodes.forEach(function (trDay) {
      if (trDay.nodeName == "TR") {
        trDay.childNodes[3].childNodes[1].innerHTML = "";
        trDay.childNodes[5].childNodes[1].innerHTML = "";
      }
    });

    // back end
    clearCalendarJSON();
  }

  function clearCalendarJSON() {
    let emptyCal = {
      Saturday: {
        meals: [""],
        events: [""],
      },
      Sunday: {
        meals: [""],
        events: [""],
      },
      Monday: {
        meals: [""],
        events: [""],
      },
      Tuesday: {
        meals: [""],
        events: [""],
      },
      Wednesday: {
        meals: [""],
        events: [""],
      },
      Thursday: {
        meals: [""],
        events: [""],
      },
      Friday: {
        meals: [""],
        events: [""],
      },
    };
    loading();
    fetch(baseURL + calendarID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ calendar: emptyCal }),
    }).then(function (response) {
      loaded();
    });
  }

  /******************* END CALENDAR *******************/

  /******************* NEW RECIPE *******************/

  // generate/convert photos.app.goo/gl/ link to jpg (NOT WORKING)
  function getPhotoImg(url) {
    loading();
    $.ajax({
      url:
        "https://cors-anywhere.herokuapp.com/https://bytenbit.com/app/host.php",
      type: "POST",
      dataType: "json",
      data: {
        Glink: url,
      },
      success: function (result) {
        document.querySelector("#newRecipePhotoImg").value = result.link + "=h400-w400-c";
        loaded();
        // console.log(result.link + "=h400-w400-c");
      },
    });
  }
  document.querySelector("#newRecipePhotoGenerate").addEventListener("click", function () {
    alert("This feature is currently not working.");
    // let newRecipePhotoUrl = document.querySelector("#newRecipePhotoUrl").value;
    // getPhotoImg(newRecipePhotoUrl);
  });

  // convert lh3.googleusercontent.com/ link to properly formatted jpg (WORKING)
  function convertPhotoImg(url) {
    return url.substring(0,url.indexOf("="))+"=h400-w400-c"
  }
  document.querySelector("#newRecipePhotoConvert").addEventListener("click", function () {
    let newRecipePhotoUrl = document.querySelector("#newRecipePhotoImg").value;
    document.querySelector("#newRecipePhotoImg").value = convertPhotoImg(newRecipePhotoUrl);
  });
  


  let newRecipeTitle = document.querySelector("#newRecipeTitle");
  let newRecipeNotes = document.querySelector("#newRecipeNotes");
  let newRecipeTags = document.querySelector("#newRecipeTags");
  let newRecipeLink = document.querySelector("#newRecipeLink");
  let newRecipePhotoUrl = document.querySelector("#newRecipePhotoUrl");
  let newRecipePhotoImg = document.querySelector("#newRecipePhotoImg");
  let newRecipeId = document.querySelector("#newRecipeId");

  document.querySelector("#addRecipe").addEventListener("click",function(){
    // newRecipeTitle = document.querySelector("#newRecipeTitle");
    // newRecipeNotes = document.querySelector("#newRecipeNotes");
    // newRecipeTags = document.querySelector("#newRecipeTags");
    // newRecipeLink = document.querySelector("#newRecipeLink");
    // newRecipePhotoUrl = document.querySelector("#newRecipePhotoUrl");
    // newRecipePhotoImg = document.querySelector("#newRecipePhotoImg");

    let newRecipe = {
      "photoUrl":newRecipePhotoUrl.value,
      "photoImg":newRecipePhotoImg.value,
      "title":newRecipeTitle.value,
      "notes":newRecipeNotes.value,
      "tags":newRecipeTags.value,
      "link":newRecipeLink.value
    }
    addRecipe(newRecipe);
  });

  var catalogHash = {};

  async function addRecipe(recipe) {
    loading();
    const jsonStore = await fetch(baseURL + catalogID).then(function (
      response
    ) {
      return response.json();
    });
    
    catalogHash = jsonStore.catalog;
    let catalogMealIndex = findRecipeIndex(catalogHash,recipe.title);
    console.log("catalogMealIndex: " + catalogMealIndex);
    console.log("recipe.title: " + recipe.title);
    if(catalogMealIndex < 0){ // add
      catalogHash.push(recipe);
    } else { // edit
      catalogHash[catalogMealIndex] = recipe;
    }
    
    fetch(baseURL + catalogID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ catalog: catalogHash }),
    }).then(function (response) {
      loaded();
      newRecipeId.value = catalogHash.length; // update DOM value (disabled to user)
      alert("Done!");
    });
  }

  document.querySelector("#deleteRecipe").addEventListener("click",function(){
    let id = newRecipeId.value;
    deleteRecipe(id);
  });


  async function deleteRecipe(id) {
    loading();
    const jsonStore = await fetch(baseURL + catalogID).then(function (
      response
    ) {
      return response.json();
    });

    // front
    document.querySelector("#recipe" + id).parentElement.parentElement.remove();

    // back
    catalogHash = jsonStore.catalog;
    catalogHash.splice(id, 1);
    fetch(baseURL + catalogID, {
        headers: {
            "Content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ catalog: catalogHash }),
    }).then(function (response) {
      clearRecipe();
      loaded();
    });
  }

  document.querySelector("#clearRecipe").addEventListener("click",function(){
    clearRecipe();
  });

  function clearRecipe(){
    newRecipeTitle.value = "";
    newRecipeNotes.value = "";
    newRecipeTags.value = "";
    newRecipeLink.value = "";
    newRecipePhotoUrl.value = "";
    newRecipePhotoImg.value = "";
    newRecipeId.value = "";
  }

  // getPhotoSrc("https://photos.app.goo.gl/HAa5bsUX8HfjNBd18");

  /******************* END NEW RECIPE *******************/

  /******************* CATALOG *******************/

  var catalog = document.querySelector("#catalog");

  var catalogHash = {};
  
  async function refreshCatalog() {
    loading();
    const jsonStore = await fetch(baseURL + catalogID).then(function (
      response
    ) {
      loaded();
      return response.json();
    });

    catalogHash = jsonStore.catalog;
    console.log(catalogHash);
    fetch(baseURL + catalogID, {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ catalog: catalogHash }),
    }).then(function (response) {
      loaded();
    });
  }
  // refreshCatalog();

  async function showCatalog() {
    loading();
    const jsonStore = await fetch(baseURL + catalogID).then(function (
      response
    ) {
      loaded();
      return response.json();
    });

    if (jsonStore.catalog != null) {
      catalogHash = jsonStore.catalog;
      // console.log(catalogHash);
      catalogHash.forEach(function (recipe, index) {
        let toAdd = "";
        toAdd += `
                      <div class="col-6 col-md-3">
                          <div class="card">
                              <div class="card-body">
                                  <p class="card-title"><span>${recipe.title}</span>
                      `;
        if (recipe.link != "") {
          toAdd += `
                              <a href=${recipe.link} target="_blank"><img src="link-icon.png" class="link-icon"></a>
                          `;
        }
        toAdd += `
                                  </p>
                              </div>
                              <img src=${recipe.photoImg} class="card-img-top recipeImg" id="recipe${index}">
                          </div>
                          <img src="plus-icon.png" class="catalogPlus">
                          <img src="edit-icon.png" class="catalogEdit">
                        </div>`;
        toAdd += `
                          <div id="recipe${index}notes" class="overlay">
                              <div class="overlayText">
                                  <h1>${recipe.title}</h1>
                                  <p>${recipe.notes}</p>
                              </div>
                          </div>
                      `;
        catalog.innerHTML += toAdd;
        $(`#recipe${index}notes .overlayText`).css("font-size", index * 5 + 10);
      });

      // show note
      $(".recipeImg").click(function () {
        var newId = "#" + $(this).attr("id") + "notes";
        $(newId).css("display", "block");
      });

      // hide note
      $(".overlay").click(function () {
        $(this).css("display", "none");
      });

      textFit(document.getElementsByClassName("overlayText"), {
        multiLine: true,
      });
      $(".overlay").css("display", "none");

      $("#shuffle-btn").click(function () {
        var catalog = document.querySelector("#catalog");
        for (var i = catalog.children.length; i >= 0; i--) {
          catalog.appendChild(catalog.children[(Math.random() * i) | 0]);
        }
      });

      catalogListenForPlus();
      catalogListenForEdit();
    }
  }
  showCatalog();

  /******************* END CATALOG *******************/

  // prevent double-tap zoom
  var lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    function (event) {
      var now = new Date().getTime();
      if (now - lastTouchEnd <= 400) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );

  // shuffle
  function sticktothebottom() {
    var window_top = $(window).scrollTop();
    var top = $("#catalog").offset().top - window.innerHeight;
    if (window_top > top) {
      $("#shuffle").addClass("stick");
      $("#catalog").height($("#stickThis").outerHeight());
    } else {
      $("#shuffle").removeClass("stick");
      $("#catalog").height(0);
    }
  }
  $(window).scroll(sticktothebottom);
  sticktothebottom();
}); //ready
