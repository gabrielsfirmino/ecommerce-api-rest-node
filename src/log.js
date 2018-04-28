const Datastore = require('@google-cloud/datastore');
module.exports = function (login, operation, type, user, timestamp) {

  const gcs = Datastore({
    projectId: 'cloud30-201916',
    keyFilename: __dirname + '/router/key.json'
  });

  console.log(login, operation, type, user, timestamp);

  const key = gcs.key(['teste', timestamp]);
  var log = {
    key: key,
    data: {
      "login": login,
      "operation": operation,
      "type": type,
      "user": user,
      "timestamp": timestamp
    }
  };

  gcs
    .save(log)
    .then((log) => {
      console.log(log);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}