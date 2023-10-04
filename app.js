/*-------------------------v EXPRESS APP SETUP v------------------------*/
const express    = require('express');
const handlebars = require('express-handlebars');
const path       = require('path');
const axios      = require('axios');
const bodyParser = require('body-parser');
const fs         = require('fs');

const app        = express();
const port       = 8080;

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended : true}));

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
/*-------------------------^ EXPRESS APP SETUP ^------------------------*/

/*----------------------------v EDAMAM API v----------------------------*/
/* API Docs https://developer.edamam.com/edamam-docs-recipe-api         */

const baseUrl     = 'https://api.edamam.com/api';
var   credentials = {
    appId  : '', 
    appKey : ''
};

/************************************************************************/
/* Func  : getRecipes                                                   */
/* Params: params - object containing the params required by the api    */
/* Return: the data portion of the JSON response recieved from the api  */
/************************************************************************/
async function getRecipes(params) {
    const res = await axios({
        method : 'GET',
        url    : `${baseUrl}/recipes/v2`,
        params : params
    });
    
    return res.data;
}

/************************************************************************/
/* Func  : getRecipesByDiet                                             */
/* Params: diet - string representing one of the supported diet filters */
/*               (balanced, high-fiber, high-protein, low-carb, low-fat */
/*               low-sodium)                                            */
/* Return: the data recieved from the func getRecipies                  */
/************************************************************************/
async function getRecipesByDiet(diet) {
    const params = {
        type    : 'public',
        app_id  : credentials.appId,
        app_key : credentials.appKey,
        diet    : diet
    }

    return getRecipes(params);
}

/************************************************************************/
/* Func  : getRecipesByQuery                                            */
/* Params: query - search string entered by the user. Can be a specific */
/*                meal, ingredient, dietary resitriction, etc.          */
/* Return: the data received from the func getRecipies                  */
/************************************************************************/
async function getRecipiesByQuery(query) {
    const params = {
        type    : 'public',
        q       : query,
        app_id  : credentials.appId,
        app_key : credentials.appKey
    }

    return getRecipes(params);
}

/************************************************************************/
/* Func  : getRecipeById                                                */
/* Params: id - the id constructed by the api for a specific recipe     */
/* Return: the data portion of the JSON response recieved from the api  */
/************************************************************************/
async function getRecipeById(id) {
    const res = await axios({
        method : 'GET',
        url    : `${baseUrl}/recipes/v2/${id}`,
        params : {
            id      : id,
            type    : 'public',
            app_id  : credentials.appId,
            app_key : credentials.appKey
        }
    });

    return res.data;
}
/*----------------------------^ EDAMAM API ^----------------------------*/

/*--------------------------v ASYNC FUNCTIONS v-------------------------*/
/************************************************************************/
/* Func  : buildRecipePreviews                                          */
/* Params: raw - JSON object received from the recipes V2 endpoint      */
/*              (see func: getRecipes)                                  */
/* Return: an array of objects containing the data to create the recipe */
/*        'previews' that can be seen in places like the main homepage  */
/************************************************************************/
async function buildRecipePreviews(raw) {
    var recipes = [];
    raw.hits.forEach(
        (recipe) => {
            var dietLabels = [];
            recipe.recipe.dietLabels.forEach(
                (label) => {
                    dietLabels.push({tag : label});
                }
            );

            const href = recipe._links.self.href;
            const recipeId = href.substring(href.lastIndexOf('/')+1, 
                                            href.indexOf('?'));

            recipes.push({
                label     : recipe.recipe.label,
                imgSrc    : recipe.recipe.image,
                dietLabel : dietLabels,
                recipeId  : recipeId
            });
        }
    );

    return recipes;
}
/*--------------------------^ ASYNC FUNCTIONS ^-------------------------*/

/*----------------------------v APP ROUTES v----------------------------*/
/************************************************************************/
/* GET '/' - Renders the main homepage. By default, this page contains  */
/*          collections of recipe previews from recommended diet types  */
/*          or nutritional categories                                   */
/************************************************************************/
app.get('/', async (req, res) => {
    // TODO - Add 'user' functionality for personalized homepages
    
    const response = await getRecipesByDiet('balanced');
    const recipes  = await buildRecipePreviews(response);

    res.render('main', {
        layout : 'index',
        recipe : recipes
    });
});

/************************************************************************/
/* GET '/search' - Renders a search results page. This page contains a  */
/*                collection of recipe previews based on a search query */
/*                entered by the user                                   */
/************************************************************************/
app.get('/search', async (req, res) => {
    const query = req.query.search;
    const response = await getRecipiesByQuery(query);
    const recipes  = await buildRecipePreviews(response);

    res.render('main', {
        layout : 'index',
        recipe : recipes
    });
});
/*----------------------------^ APP ROUTES ^----------------------------*/

/*----------------------------v START APP v-----------------------------*/
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})
/*----------------------------^ START APP ^-----------------------------*/