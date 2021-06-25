var mysql = require('mysql2')
const DBConfig = require('./DBConfig')

var connection = mysql.createConnection(
    DBConfig
)
//PROTOCOL_CONNECTION_LOST
//일정 시간동안 접속 없을 경우 DB Connection이 끊어지는 경우를 방지
//PROTOCOL_CONNECTION_LOST로 인해 끊어질 경우 다시 연결함.

/*
function handleDisconnect(){
    connection.connect(function(err){
        if(err){
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }else{
            console.log('DB connected')
        }
    });

    connection.on('error', function(err){
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            return handleDisconnect();
        }else{
            throw err;
        }
    })
}

handleDisconnect();
*/
module.exports = connection