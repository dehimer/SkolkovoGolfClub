const http = require('http');
const express = require('express');
const app = express();

const fs = require('fs');
const listofholes = JSON.parse(fs.readFileSync('data/listofholes.json', 'utf8'));
const listofphotos = fs.readdirSync('client/media/photos');


if(process.env.npm_lifecycle_event === 'dev')
{
  	const webpack = require('webpack');
	const webpackConfig = require('./webpack/common.config.js');
	const compiler = webpack(webpackConfig);

	app.use(require('webpack-dev-middleware')(compiler, {
		noInfo: false, publicPath: webpackConfig.output.publicPath,
	}));

	app.use(require('webpack-hot-middleware')(compiler, {
		log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000,
	}));

};

app.use(express.static(__dirname + '/client'));



app.get(/^\/pad$/, (req, res) => {
	console.log('pad page');
  	res.sendFile(__dirname + '/client/pad.html');
});

app.get(/^\/screen$/, (req, res) => {
	console.log('screen page');
	res.sendFile(__dirname + '/client/screen.html');
});

app.get(/^\/serverip$/, (req, res) => {
	res.send(req.headers.host)
});


const server = new http.Server(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT);
console.log('server runned on port: '+PORT);


const io = require('socket.io')(server);

io.on('connection', function (socket) {

	console.log('socket client connection');

	socket.emit('listofholes', listofholes);
	socket.emit('listofphotos', listofphotos);
	
	socket.on('holeselected', id => {
    	io.emit('holeselected', id);
  	});

  	socket.on('holeunselect', id => {
    	io.emit('holeunselect', id);
  	});
});