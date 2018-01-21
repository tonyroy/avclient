const WebSocket = require('ws');

vehicles = [ {id: 66000 , loc:1234},{id: 66001 , loc:1234},{id: 66002, loc: 2345}]; 

function heartbeat() {
      this.isAlive = true;
      console.log('pinged');
}

function ack(err){
      if (err) {
            console.error(err);
            connect()
      } else {
            console.log('message sent ')
      }
}
function on_closed() {
      console.log('closed');
      connect()
}

function connect() {
      try {

       // var ws = new WebSocket('ws://node-express-env.c2reamfpun.us-west-2.elasticbeanstalk.com/connect/');
            var server = process.env.SERVER || 'localhost:3000';
            var ws = new WebSocket('ws://' + server + 'connect/');

            ws.on('open', function open() {
                  msg = 'Connected to ADG';
                  ws.send(JSON.stringify(msg),  ack );
            });

            ws.on('message', function incoming(msg) {
                  console.log('raw : ' + msg);
                  
                  request = JSON.parse(msg);
                  if (request.sessionId) {
                        var data;
                        console.log("update request recieved for session " +request.sessionId);
                        var id = request.status.match(/.*(\d{5}).*/);
                        if (id) {
                              console.log ('matches = ' + id[0]);
                              var found = vehicles.find( x => x.id == id[0]);
                              if (found) {
                                    data = found;
                                    data.timestamp = Date();
                              }

                        } else {
                              vehicles.forEach(vehicle => {
                              vehicle.timestamp = Date();
                              });
                              data = vehicles;
                        }
                        resp = {'sessionId': request.sessionId, 'status': data};
                        console.log('sending ' + JSON.stringify(resp));
                        ws.send(JSON.stringify(resp), ack );
                  };
            });

            ws.on('ping', heartbeat); 

            ws.on('close', on_closed) ;
      } catch (ex) {
            console.log(ex);
      }
};


connect();