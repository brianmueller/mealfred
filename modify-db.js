let baseURL = "https://json.extendsclass.com/bin/"
let queueID = "ef284303e4e9";
let calendarID = "0dd7d122ccf4";
let catalogID = "6101bafd48bf";
// let apiKey = getUrlParameter("apiKey");
let apiKey = "e134e98c-5f4d-11eb-b69b-0242ac110002";



async function modifyQueue() {
    const jsonStore = await fetch(baseURL + queueID).then(function (
    response
    ) {
    return response.json();
    });

    queueHash = jsonStore.queue;
    
    /******** MODIFY HERE *******/
    console.log(queueHash);
    // reset
    queueHash = ["", "IP Ham & Lentil Soup", "LOs", "LOs", "Pizza night!", "LOs", "Chicken zuquinoa"];
    // queueHash = [
    //     {
    //         "title":"IP Ham & Lentil Soup",
    //         "id":1
    //     },
    //     {
    //         "title":"LOs",
    //         "id":null
    //     }
    // ]

    
    /******** MODIFY HERE *******/

    fetch(baseURL + queueID, {
        headers: {
            "Content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ queue: queueHash }),
    }).then(function (response) {
    });
}



/******************* NEW RECIPE *******************/

// let newRecipePhotoUrl = ;
// getPhotoImg(newRecipePhotoUrl);

function getPhotoImg(url) {
    $.ajax({
    url:
        "https://cors-anywhere.herokuapp.com/https://bytenbit.com/app/host.php",
    type: "POST",
    dataType: "json",
    data: {
        Glink: url,
    },
    success: function (result) {
        console.log(result.link + "=h400-w400-c");
    },
    });
}

// let newRecipe = {
//     "photoUrl":,
//     "photoImg":,
//     "title":,
//     "notes":,
//     "tags":,
//     "link":
// }
// addRecipe(newRecipe);



var catalogHash = {};

async function addRecipe(recipe) {
    const jsonStore = await fetch(baseURL + catalogID).then(function (
    response
    ) {
    return response.json();
    });


    catalogHash = jsonStore.catalog;
    catalogHash.push(recipe);
    console.log(catalogHash);
    console.log(baseURL+catalogID);
    fetch(baseURL + catalogID, {
        headers: {
            "Content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ catalog: catalogHash }),
    }).then(function (response) {
    });
}

let newRecipe = {
    "photoUrl":"https://photos.app.goo.gl/WRfcibmznVxuE4iE6",
    "photoImg":"https://lh3.googleusercontent.com/2AYPH_MiFyjwBt46VvhSqhdzT5wzKYaxMf8TMykb_sgX7zAc4ktO_LYHUYg9MGx1p8Fg3kfMVWKie4isV07DAudgW6oRGWCHcRBFBonuhzYowBA6hJzrprylJ5uCA43kx0n1ISxoc-U=h400-w400-c",
    "title":"TEST",
    "notes":"Sauté onion, garlic, carrots (sausage optional). Add 2 cans petite diced tomatoes, salt, pepper, oregano, 2c chicken broth, stir. Add tortellini. 15+0.  Add a few ounces of heavy cream, and thicken with cornstarch slurry. Can add spinach and/or kale.",
    "tags":"sausage,ip,one-pot",
    "link":"",
    "id":69
}



async function deleteLastRecipe() {
    const jsonStore = await fetch(baseURL + catalogID).then(function (
    response
    ) {
    return response.json();
    });

    catalogHash = jsonStore.catalog;
    catalogHash.splice(catalogHash.length-1, 1); // not sure if length-1
    fetch(baseURL + catalogID, {
        headers: {
            "Content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ catalog: catalogHash }),
    }).then(function (response) {
    });
}



async function modifyRecipe() {
    const jsonStore = await fetch(baseURL + catalogID).then(function (
    response
    ) {
    return response.json();
    });

    catalogHash = jsonStore.catalog;
    
    /******** MODIFY HERE *******/
    catalogHash[catalogHash.length-1].id = 68;
    catalogHash[catalogHash.length-1].photoIm
    /******** MODIFY HERE *******/

    fetch(baseURL + catalogID, {
        headers: {
            "Content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ catalog: catalogHash }),
    }).then(function (response) {
    });
}

async function deleteRecipe(id) {
    // loading();
    const jsonStore = await fetch(baseURL + catalogID).then(function (
      response
    ) {
      return response.json();
    });

    // front
    // document.querySelector("#recipe" + id).parentElement.parentElement.remove();

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
    //   clearRecipe();
    //   loaded();
    });
  }



async function modifyAllRecipes() {
    const jsonStore = await fetch(baseURL + catalogID).then(function (
    response
    ) {
    return response.json();
    });

    catalogHash = jsonStore.catalog;
    
    /******** MODIFY HERE *******/
    console.log(catalogHash);
    catalogHash.forEach(function(recipe,i){
        recipe.id = i;
    });
    console.log(catalogHash);
    /******** MODIFY HERE *******/

    fetch(baseURL + catalogID, {
        headers: {
            "Content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ catalog: catalogHash }),
    }).then(function (response) {
    });
}



// to run

// modifyQueue();
// addRecipe(newRecipe);
// deleteLastRecipe();
// modifyRecipe();
// modifyAllRecipes();
// deleteRecipe(69);