var express = require('express')
var app = express()
var fs = express("fs");

app.set('port', (process.env.PORT || 5002))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
response.sendfile('./login.html');
})

app.get('/login', function(request, response) {
response.sendfile('./index.html');
})

app.get('/:name', function(request, response) {

   var options = {
       root: __dirname + '/',
       headers: {
          'x-timestamp': Date.now(),
           'x-sent': true
        }
    }; 

   var fileName = request.params.name;
    response.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
})


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})