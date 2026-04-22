const https = require('https');

exports.handler = function(event, context, callback) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return callback(null, { statusCode: 200, headers: headers, body: '' });
  }

  var body = JSON.parse(event.body);
  var apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'] || '';

  var payload = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: body.messages
  });

  var options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  var req = https.request(options, function(res) {
    var data = '';
    res.on('data', function(chunk) { data += chunk; });
    res.on('end', function() {
      callback(null, {
        statusCode: res.statusCode,
        headers: Object.assign(headers, { 'Content-Type': 'application/json' }),
        body: data
      });
    });
  });

  req.on('error', function(e) {
    callback(null, {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message })
    });
  });

  req.write(payload);
  req.end();
};
