let http = require('http');
let url = require('url');
var fs = require('fs');
const game = require('./server/game.js');
const staticS = require('./server/static.js');

const port = 8979;

let dataArray = [];
let waitingList = [];
let currentGames = [];

const headers = {
    plain: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    }
};

function getData() {
    fs.readFile("./server/mancalaData.txt", 'utf-8', function (err, data) {
        dataArray = JSON.parse(data);
    });
}

async function doGet(pathname, request, response, params) {
    let answer = {};
    switch (pathname) {
        case '/update':
            answer = await game.remember(params, response, waitingList, currentGames);
            request.on('close', () => game.forget(params, waitingList, currentGames));
            answer.style = 'sse';
            break;
        default:
            staticS.processRequest(request, response);
            answer.html = true;
            break;
    }

    return answer;
}

async function doPost(pathname, request) {
    var answer = {};

    switch (pathname) {
        case '/register':
            answer = await game.register(request, dataArray);
            break;
        case '/ranking':
            answer = game.ranking(dataArray);
            break;
        case '/join':
            answer = await game.join(request, dataArray, currentGames, waitingList);
            break;
        case '/leave':
            answer = await game.leave(request, currentGames, dataArray);
            break;
        case '/notify':
            answer = await game.notify(request, currentGames, dataArray);
            break;
        default:
            answer.status = 400;
            break;
    }

    return answer;
}

getData();

http.createServer(async function (request, response) {
    const preq = url.parse(request.url, true);
    const pathname = preq.pathname;
    let answer = {};

    switch (request.method) {
        case 'GET':
            const params = preq.query;
            answer = doGet(pathname, request, response, params);
            answer.style = 'sse';
            break;
        case 'POST':
            answer = await doPost(pathname, request);
            break;
        default:
            answer.status = 400;
    }

    if (answer.html) return;
    if (answer.status === undefined)
        answer.status = 200;
    if (answer.style === undefined)
        answer.style = 'plain';

    response.writeHead(answer.status, headers[answer.style]);
    if (answer.message !== undefined) response.write(answer.message);
    if (answer.style === 'plain') response.end();
}).listen(port);
