const pug = require('pug');
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

const pathPublic = path.join(__dirname, 'public');

app.use(express.static(pathPublic));
app.set('view engine', 'pug');

const port = 3000;

mongoose.connect("mongodb://localhost/TP_Web", { useNewUrlParser: true});
const db = mongoose.connection;
db.once("open", function() {});
db.on("error", console.error.bind(console, 'connection error:'));

const citySchema = new mongoose.Schema({
    name: String
});

const City = mongoose.model("City", citySchema);

app.get('/', (req,res) => {
    City.find(function (err, cities) {
        if (err) {
            sendHTML(res, 'error', err);
        } else {
            console.log(cities);
            sendHTML(res, 'allInfos', cities);
        }
    })
});

app.get('/cities', (req,res) => {
    City.find(function (err, cities) {
        if (err) {
            sendHTML(res, 'error', err);
        } else {
            console.log(cities);
            sendHTML(res, 'allInfos', cities);
        }
    })
});

app.use(express.urlencoded({ extended: true }));

app.post('/city', (req,res) => {
    console.log(req.body);
    const thisCity = req.body;
    City.find(function (err, cities) {
        if (err) {
            sendHTML(res, 'error', err);
        } else {
            if(!cities.includes(thisCity.name)) {
                const newCity = new City({ name: thisCity.name});
                newCity.save(function (err) {
                    if (err) {
                        sendHTML(res, 'error', err);
                    } else {
                        res.redirect('/cities');
                    }
                })
            } else {
                sendHTML(res, 'error', "La ville existe déjà");
            }
        }
    })
});

app.post('/city/:id', (req,res) => {
    console.log(req.params.id);
    // FAIRE DU JAVASCRIPT POUR FAIRE LE DELETE ET LE PUT
    if(req.params.action === "DELETE") {
        City.deleteOne({ _id: req.params.id }, function (err) {
            if (err) {
                return handleError(err);
            } else {
                res.redirect("/cities");
            }
        });
    } else if(req.params.action === "PUT") {
        City.updateOne({ _id: req.params.id }, function(err, res) {
            if (err) {
                return handleError(err);
            } else {
                res.redirect("/cities");
            }
        });
    } else {
        console.log("error");
    }
});

app.listen(port, () => console.log(`Server running at port ${port}`))


function csvToJson(data) {

    let jsonData = {"infos" : {}};
    let allCSVligns = data.split('\n');
    let count = 0;
    allCSVligns.forEach( (element) => {
        const user = element.split(';')[0];
        const city = element.split(';')[1];
        const newInfo = 'info' + count;
        jsonData.infos[newInfo] = {"user" : user, "city": city};
        count++; 
    })

    return jsonData;
}

function sendHTML(res, payloadName, payload) {
    let generatedTemplate;
    if(payloadName === "error") {
        res.render('template', { error: payload });
    } else {
        res.render('template', {allInfos: payload});
    }
}