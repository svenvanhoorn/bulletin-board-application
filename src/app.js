var fs = require ( 'fs' )
var express = require ( 'express' )
var app = express()
var bodyParser = require('body-parser'); // include body parser 

// use the css and js files from public
app.use(express.static('./public/css'));
app.use(express.static('./public/js'));

app.use(bodyParser.urlencoded({ extended:true }))

// to set jade as the view engine for all files in directory: views
app.set('views', './src/views');  
app.set('view engine', 'jade');

var pg = require('pg'); // require postgres

// note: postgres://[user]:[password]@[server]:[port]/[name_database]
// Sven's connectionString to database: 
// note for sven, whenever I change relaunch the DB, the PORT number changes
// var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@192.168.99.100:32779/bulletinboard';
// your connetionString to database:
var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletinboard';
////////////////////// homepage with a welcome and message form ////////////////////////////////////
app.get('/', function (req, res) {
	console.log("We entered Home")
	res.render('index', {
		title: "bullitin-board-app"
	});
})

/////////////////POST POST POST //// after submitting message on index.jade //////////////////////////////
app.post('/postmessage', function (req, res) {

	var messageTitle = req.body.title
	var messageBody = req.body.body

	pg.connect(connectionString, function (err, client, done) {
		client.query('insert into messages (title,body) values ($1,$2)', [ messageTitle, messageBody ], function (err, result) {
			if (err) {
				if (client) {
					done(client)
				}
				return
			}
			done();
		pg.end(); // the client will idle for another 30 seconds, temporarily preventing the app from closing, unless this function is called
	});
	});  
	res.redirect('messages');
});

//////////////////////////////MESSAGE PAGE////////////////////////////////////////////////////////////////
app.get('/messages', function(req, res) {
	console.log("We entered messages")
	pg.connect(connectionString, function (err, client, done) {
		if (err) {
			if (client) {
				done(client);
			}
			return;
		}
	console.log("We made a DB connetion on table messages")
		client.query('select * from messages', function (err, result) {
			var allMessages = result.rows
			if (err) {
				done(client)
			} else {
				done()
		console.log("These are all rows in table messages:")
		console.log(allMessages)
				res.render('messages', {
					title: "All messages",
					messages: allMessages
				})
			}
		});
	});
})
/////////////////////////SERVER////set localhost on port 3000//////////////////////////////////////////////
var server = app.listen(3000, function () {
	console.log('User app listening on port: ' + server.address().port);
});
