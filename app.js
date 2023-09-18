/*---------------v EXPRESS APP SETUP v---------------*/
const express    = require('express');
const handlebars = require('express-handlebars');
const path       = require('path');
const bodyParser = require('body-parser');

const app        = express();
const port       = 8080;

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended : true}));

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
/*---------------^ EXPRESS APP SETUP ^---------------*/

/*------------------v APP ROUTES v-------------------*/
app.get('/', (req, res) => {
    res.render('main', {
        layout: 'index'
    });
});
/*------------------^ APP ROUTES ^-------------------*/

/*-------------------v START APP v-------------------*/
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})
/*-------------------^ START APP ^-------------------*/