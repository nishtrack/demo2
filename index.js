var express = require('express')
var app = express()
var fs = express("fs");

app.set('port', (process.env.PORT || 5002))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
 console.log(fs);
response.sendfile('./index.html');
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})