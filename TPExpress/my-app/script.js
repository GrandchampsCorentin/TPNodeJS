const fs = require('fs');
const pug = require('pug');
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const express = require("express");
const app = express();
const pathPublic = path.join(__dirname, 'public');

app.use(express.static(pathPublic));
app.set('view engine', 'pug');

const port = 3000;

app.get('/', (req,res) => {
    let url = req.url;
    let filename = "";

    if(url.indexOf("filename") !== -1) {
        filename = url.split("filename=")[1];
        if(filename.indexOf('&') !== -1) {
            filename = filename.split('&')[0];
        }
    
        if(filename !== "" && filename !== null && filename !== undefined) { 
            fs.readFile(pathPublic + '/' + filename,'utf8', (err, data) => {
                if(err) {
                    sendHTML(res, 'error', "Fichier introuvable");
                    return
                } 
                const jsonData = csvToJson(data);
                sendHTML(res, 'allInfos', jsonData.infos);
            })
        } else {
            sendHTML(res, 'error', "Fichier introuvable");
        }
    } else {
        sendHTML(res, 'error', "Indiquez dans l'url le nom d'un fichier comme ceci : ?filename=data.csv")
    }
});

app.get('/cities', (req,res,next) => {
    fs.readFile(pathPublic + "/cities.json", 'utf8', (err, data) => {
        if(err) {
            next(err);
        } else {
            res.send(data);
        }
    })
});

app.post('/city', (req,res, body) => {
    console.log(body);
    fs.readFile(pathPublic + "/citis.json", 'utf8', (err, data) => {
        if(err) {
            const cityJson = {
                "cities": [
                    { "id" : uuidv4(), "name" : body }
                ]
            }
            // créer le fichier
            fs.writeFile('citis.json', cityJson, function (err) {
                if (err) throw err;
                console.log('File is created successfully.');
              }); 
            res.send(body);
        } else {
            // vérifier que la nouvelle ville n'existe pas
            res.send(data);
        }
    })
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
    res.status(200).send(generatedTemplate);
}