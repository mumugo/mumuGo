var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket

var ppt = null;
var controller = null;


                                
var snakes = [];
var apple = {
    x: 0,
    y: 0,
    z: 0
};
setApple();
io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //user leaves
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');


        removeSnakeBySocket(socket);

        if (ppt == socket) {
            ppt = null;
        }
        if (controller == socket) {
            controller = null;
        }

    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });





    socket.on('getNewSnake', function() {
        getNewSnake(socket);
    });
    socket.on('changeDirection', function(currentDirection) {
        console.log(currentDirection)
        socket.currentDirection = currentDirection;
    });



    socket.on('pptInit', function() {
        if (ppt == null) {
            ppt = socket;
        }
    });
    socket.on('controllerInit', function() {
        if (controller == null) {
            controller = socket;
        }
    });
    socket.on('controllerPrev', function() {
        // if (controller == socket) {
            ppt.emit("pptPrev");
        // }
    });
    socket.on('controllerNext', function() {
        // if (controller == socket) {
            ppt.emit("pptNext");
        // }
    });
    socket.on('controllerZF', function() {
        // if (controller == socket) {
            ppt.emit("pptZF");
        // }
    });
    socket.on('controllerZYJ', function() {
        // if (controller == socket) {
            ppt.emit("pptZYJ");
        // }
    });
    socket.on('controllerWZ', function() {
        // if (controller == socket) {
            ppt.emit("pptWZ");
        // }
    });
    socket.on('controllerLML', function() {
        // if (controller == socket) {
            ppt.emit("pptLML");
        // }
    });
});
function getNewSnake (socket) {
    var x, y ,z;
    var tryTimes = 100;
    var isSafe = false;
    do {
        x = Math.floor(Math.random() * 40 - 20);
        y = Math.floor(Math.random() * 40 - 20);
        z = 0;
        tryTimes--;
        isSafe = checkZone({
            x: x,
            y: y,
            z: z,
        })
    }
    while (!isSafe && tryTimes > 0)

    if (isSafe) {
        var pos = {x: x, y: y, z: 0};
        socket.gamestart = true;
        socket.currentDirection = -1;
        snakes.push({
            id: new Date().getTime(),
            nodes: [
                {x: x, y: y, z: z},
                {x: x + 1, y: y, z: z},
                {x: x + 2, y: y, z: z}
            ],
            color: Math.floor(Math.random() * 256) * 256 *256 + Math.floor(Math.random() * 256) * 256 + Math.floor(Math.random() * 256),
            socket: socket
        })
        //socket.emit('gotSnake');
    } else {
        setTimeout(function(){
            getNewSnake();
        },3000);
    }
}
function checkCollision (x, y, z) {
    for (var i = 0; i < snakes.length; i++) {
        for (var j = 0; j < snakes[i].nodes.length; j++) {
            if (snakes[i].nodes[j].x == x && snakes[i].nodes[j].y == y && snakes[i].nodes[j].z == z) {
                return {
                    id: snakes[i].id,
                    isCollision: true
                };
            }
        }
    }
    if (apple.x == x && apple.y == y && apple.z == z) {
        return {
            id: 'apple',
            isCollision: true
        };
    }
    
    return {
        id: undefined,
        isCollision: false
    };
}
function checkZone (pos) {
    // return if the area is safe
    for (var i = pos.x - 10; i <= pos.x + 10; i++ ) {
        for (var j = pos.y - 10; j <= pos.y + 10; j++ ) {
            if ( checkCollision(i, j, pos.z).isCollision ) {
                return false;
            }
        }
    }
    return true;
}
function removeSnakeById(id) {
    for (var i = 0; i < snakes.length; i++) {
        if (snakes[i].id == id) {
            snakes.splice(i, 1);
        }
    }
}
function removeSnakeBySocket(socket) {
    for (var i = 0; i < snakes.length; i++) {
        if (snakes[i].socket == socket) {
            snakes.splice(i, 1);
        }
    }
}
function setApple () {
    var isok;
    var xP,yP;
    do {
        isok = true;
        xP = Math.floor(Math.random()*30 - 15);
        yP = Math.floor(Math.random()*30 - 15);
        isok = !checkCollision(xP, yP, 0).isCollision;
    } while (!isok);
    apple.x = xP;
    apple.y = yP;
}
setInterval(function(){
    console.log("refresh data");
    refreshData();
},100)
function refreshData() {
    for (var i = 0; i < snakes.length; i++) {
        for (var j = snakes[i].nodes.length - 1; j >= 0; j--) {
            if (j == 0) {
                var newNode = {
                    x: snakes[i].nodes[j].x,
                    y: snakes[i].nodes[j].y,
                    z: snakes[i].nodes[j].z
                };
                var currentDirection = snakes[i].socket.currentDirection;
                switch (currentDirection) {
                    case -1:
                        newNode.x--;
                        break;
                    case 1:
                        newNode.x++;
                        break;
                    case -2:
                        newNode.y--;
                        break;
                    case 2:
                        newNode.y++;
                        break;   
                }
                //判断撞到苹果
                var checkCollisionObj = checkCollision(newNode.x, newNode.y, newNode.z);
                if (checkCollisionObj.id == 'apple') {
                    setApple();
                    var newP = snakes[i].nodes[snakes[i].nodes.length-1];
                    snakes[i].nodes.push({
                        x: newP.x,
                        y: newP.y,
                        z: newP.z
                    })
                } else if (checkCollisionObj.id != undefined) {
                    removeSnakeById(snakes[i].id);
                    removeSnakeById(checkCollisionObj.id);
                    break;
                }
                snakes[i].nodes[j].x = newNode.x;
                snakes[i].nodes[j].y = newNode.y;
                snakes[i].nodes[j].z = newNode.z;
            } else {
                var newP = snakes[i].nodes[j-1];
                snakes[i].nodes[j].x = newP.x;
                snakes[i].nodes[j].y = newP.y;
                snakes[i].nodes[j].z = newP.z;
            }
        }
    }
    //brodcast
    for (var i = 0; i < snakes.length; i++) {
        snakes[i].socket.emit('refreshData', {
            snakes: snakes.map(function(snake){
                return {
                    nodes: snake.nodes,
                    color: snake.color
                }
            }),
            apple: apple
        });
    }
}