//Server side program to take relevant information from a website for users to comment on
//================================================================================================//

//Requiring the necessary program files to run the server
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var express = require("express");
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var request = require("request");
var path = require("path");

//Allows use of express module
var app = express();

//Sets public file to be available for public view
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//Sets up calls for mongojs for local use
//var databaseURL = "ScraperDB";
//var collections = ["articles"];

// use mongojs to hook the database to the db variable 
//var db = mongojs(databaseURL, collections);
var config = require('./config.js');
var db = mongojs(config.dbURI, [config.collections])

app.get('/', function (req, res) {
	db.articles.find({}, function (err, data) {
		if (err) throw err;
		res.render("index", { articles: data });
	})
})

app.get('/submit', function (req, res) {
	//Loads the web page into the request package to grab information for the user to view
	request("http://www.massivelyop.net", function (err, response, html) {

		//Allows the use of $ similar to jQuery
		var $ = cheerio.load(html);

		//Result will hold an array of data objects containing all the news articles information
		var result = [];

		//Finds each called element within the document and saves the pertinent ones for our page
		$("article").each(function (i, element) {
			var article = {};
			//Grabs the titles of each article
			var title = $(this).find("post-title").children().text().trim();

			//Grabs the description of each article, if available
			var desc = $(this).find("div.desc").text().trim();

			//Grabs the image of each article, if available
			var image = $(this).find("img").attr("src");

			//Grabs the link to the article
			var link = "http://www.massivelyop.net" + $(this).children().attr("href");

			//makes sure the article has a description
			if (desc !== '') {
				//Moves captured info to article object
				article.title = title;
				article.desc = desc;
				article.image = image;
				article.link = link;
				article.comments = [];

				console.log(article);
				result.push(article);

				db.articles.find({ 'title': article.title }, function (err, articleData) {
					if (articleData == true) {
						console.log("Article already present.")
					} else {
						//inserts articles into db.
						db.articles.save(article, function (err, data) {
							if (err) throw err;
							//console.log(data);
						});
					};
				});
			};
		});
		//Tests data capture
		//console.log(result);
	});
	res.send(result);
});

app.post('/addComment', function (req, res) {
	//console.log(req.body);
	var newComment = {
		user: req.body.user,
		comment: req.body.comment,
		created: req.body.created,
	};
	db.articles.update({ '_id': mongojs.ObjectId(req.body.id) }, { $push: { "comments": newComment } }, function (err, data) {
		if (err) throw err;
		console.log(data);
	});
	res.send(newComment);
});

app.post('/delete', function (req, res) {
	var toBeDeleted = {
		id: req.body.id,
		user: req.body.user,
		comment: req.body.comment,
		created: req.body.created,
	};
	console.log(toBeDeleted);
	db.articles.update({ '_id': mongojs.ObjectId(toBeDeleted.id) }, { $pop: { 'comments': 1 } }, function (err, data) {
		if (err) throw err;
		res.send(data);
	});
})

var port = process.env.PORT || 4200;
// listen on port 4200
app.listen(port, function () {
	console.log('App running on port 4200!');
});