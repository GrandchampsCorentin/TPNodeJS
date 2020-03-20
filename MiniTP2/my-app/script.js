const fs = require('fs');
const http = require('http');
const pug = require('pug');


const filename = process.argv[2];
const compiledFunction = pug.compileFile('template.pug');
const port = 3000;

const server = http.createServer((req, res) => {
    
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
})

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
})