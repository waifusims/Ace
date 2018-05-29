/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};

// game.js //////////

var Game = {};

// client
Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

// client
Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png');
};

// client
Game.create = function(){
    Game.playerMap = {};
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    testKey.onDown.add(Client.sendTest, this);
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    layer.events.onInputUp.add(Game.getCoordinates, this);
    Client.askNewPlayer();
};

// client
Game.getCoordinates = function(layer,pointer){
    Client.sendClick(pointer.worldX,pointer.worldY);
};

// client
Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
};

// client
Game.movePlayer = function(id,x,y){
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var tween = game.add.tween(player);
    var duration = distance*10;
    tween.to({x:x,y:y}, duration);
    tween.start();
};

// client
Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

////////////////////

Client.socket = io.connect();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y});
};

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('move',function(data){
    Game.movePlayer(data.id,data.x,data.y);
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.socket.on('allplayers',function(data){
    updatePlayers(data);
});

function updatePlayers(allPlayers)
{
    // Game.playerMap.forEach(function(p)
    // {
    //     p.Destroy();
    // });

    Object.keys(Game.playerMap).forEach(function(socketID){
        Game.playerMap[socketID].destroy();
    });

    Game.playerMap = {};

    for(let i = 0; i < allPlayers.length; i++)
    {
        Game.addNewPlayer(allPlayers[i].id,allPlayers[i].x,allPlayers[i].y);
    }
}