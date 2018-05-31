var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.lastPlayderID = 0;

server.listen(process.env.PORT || 8080, function(){
    console.log('Listening on '+server.address().port);
});

io.on('connection',function(socket){

    socket.player =
    {
        id: server.lastPlayderID++,
        x: randomInt(100,400),
        y: randomInt(100,400)
    };

    updateClients(socket);

    socket.on('click',function(data)
    {
        console.log(socket.id + ' - click: (' + data.x + ', ' + data.y + ")");

        try
        {
            if(socket.player != undefined)
            {
                socket.player.x = data.x;
                socket.player.y = data.y;
            }
            // else
            // {
            //     socket.disconnect();    
            // }

            updateClients(socket);
        }
        catch(e)
        {
            throw "player is dead (?) - " + e;
        }
    });

    socket.on('disconnect',function()
    {
        updateClients(socket);
    });

    socket.on('test',function()
    {
        console.log('test received');
    });
});

module.exports = app;

function getAllPlayers()
{
    var players = [];   

    console.log("Connected Sockets: ");

    Object.keys(io.sockets.connected).forEach(function(socketID)
    {
        console.log(socketID);
        var player = io.sockets.connected[socketID].player;
        
        if(player)
        {
            console.log(socketID + ": player " + player.id);
            players.push(player);
        }
        else
        {
            io.sockets.connected[socketID].disconnect();
        }
    });

    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function updateClients(socket)
{
    // send current game state to client
    var allPlayers = getAllPlayers();
    socket.emit('allplayers', allPlayers);
    socket.broadcast.emit('allplayers', allPlayers);
}