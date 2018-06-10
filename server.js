const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.use(function(req, res, next) {
  for (var key in req.query)
  { 
    req.query[key.toLowerCase()] = req.query[key];
  }
  next();
});

app.use(express.static('public', {'extensions': ['html']}))

app.post('/data', (req, res) => {
    var file, logObj, data;
    file = fs.readFileSync('./public/data.json');
    logObj = JSON.parse(file)
    logObj.push(req.body);
    data = JSON.stringify(logObj, null, 2);
    fs.writeFileSync('./public/data.json', data);
    res.status(200).end();  
});