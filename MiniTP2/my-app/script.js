const fs = require('fs');
const http = require('http');
const pug = require('pug');

const compiledFunction = pug.compileFile('template.pug');
const port = 3000;

const server = http.createServer((req, res) => {
    let url = req.url;
    let filename = "";

    if(url.indexOf("filename") !== -1) {
        filename = url.split("filename=")[1];
        if(filename.indexOf('&') !== -1) {
            filename = filename.split('&')[0];
        }
    
        if(filename !== "" && filename !== null && filename !== undefined) { 
            fs.readFile('./' + filename,'utf8', (err, data) => {
                if(err) {
                    console.log(err);
                    return
                } 
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
                
                const generatedTemplate = compiledFunction({
                    allInfos: jsonData.infos
                })
                res.statusCode = 200;
                res.setHeader("Content-Type","text/html");
                res.end(generatedTemplate);
            })
        } else {
            const generatedTemplate = compiledFunction({
                error: "Indiquez dans l'url le nom d'un fichier comme ceci : filename=data.csv"
            })
            res.statusCode = 200;
            res.setHeader("Content-Type","text/html");
            res.end(generatedTemplate);
        }
    }
})

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
})