var socketio = require('socket.io-client');
var mtgox = require('mtgox-orderbook');
var tz = require('timezone/loaded');

var conn = socketio.connect(mtgox.socketio_url);
var obook = mtgox.attach(conn, 'usd');

mtgox.subscribe('24e67e0d-1cad-4cc0-9e7a-f8523ef460fe');
mtgox.subscribe('dbf1dee9-4f2e-4a08-8cb7-748919a71b21');

var headers = ['date', 'date_ymd', 'type', 'subtype', 'tid', 'price', 'amount',
'volume', 'price_int', 'amount_int', 'volume_int', 'total_volume_int', 'primary', 'properties'];

console.log(headers.join(','));

function writeEvent (detail) {
  var row = [];
  headers.forEach(function (header) {
    var value;
    switch (header) {
      case 'date':
        if (detail.date) {
          value = detail.date;
        }
        else {
          value = Math.round(Date.now() / 1000);
        }
        break;
      case 'date_ymd':
        if (detail.date) {
          value = tz(detail.date, '%F %T');
        }
        else {
          value = tz(Date.now(), '%F %T');
        }
        break;
      case 'type':
        if (typeof detail.type === 'number') {
          value = 'order';
        }
        else {
          value = 'trade';
        }
        break;
      case 'subtype':
        value = detail.type_str || '';
        break;
      default:
        if (detail.hasOwnProperty(header)) {
          value = String(detail[header]);
          if (~value.indexOf(',')) {
            value = '"' + value + '"';
          }
        }
        else {
          value = '';
        }
    }
    row.push(value);
  });
  console.log(row.join(','));
}

obook.on('depth', writeEvent);
obook.on('trade', writeEvent);