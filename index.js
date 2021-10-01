const WebSocket = require('ws');
const mysql = require('mysql');

let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'websocket',
});

con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    // var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
    // con.query(sql, function (err, result) {
    //   if (err) throw err;
    //   console.log("1 record inserted");
    // });
  });

const wss = new WebSocket.Server({port : 5500});
const clients = {};
const clientID = [];

wss.on("connection", ws => {
    console.log("We are connected bitch");
    ws.id = Math.floor(Math.random() * 3);
    clients[ws.id] = ws;
    clientID.push(ws.id);
    let obj = {
        type: 'clientID',
        data: clientID
    }
    let client = {
        type: 'id',
        id: ws.id,
    }
    ws.send(JSON.stringify(obj));
    ws.send(JSON.stringify(client));
    
    ws.on("message", (message) => {
        let temp_message = JSON.parse(message);
        temp_message.from = ws.id;
        temp_message.type = 'message';
        let chat_id = [ws.id, parseInt(temp_message.to)];
        chat_id.sort();
        chat_id = chat_id.toString().replace(",","");
        let sql = `INSERT INTO messages (from_id, to_id, message, chat_id) VALUES (${ws.id}, ${temp_message.to},'${temp_message.message}',${chat_id})`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
        console.log(`sent ${temp_message}`);
        ws.send(JSON.stringify(temp_message));
        clients[parseInt(temp_message.to)].send(JSON.stringify(temp_message));
    });

    ws.on("close", () => {
        console.log("Disconnected");
        let index = clientID.findIndex(elem => elem === ws.id);
        clientID.splice(index, 1);
    })
});