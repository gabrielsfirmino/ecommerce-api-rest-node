module.exports = function(login, operation, type, user, timestamp, aws) {

  var docClient = new aws.DynamoDB.DocumentClient();
  var table = 'logInfo';

  console.log(login, operation, type, user, timestamp);

  var params = {
    TableName: table,
    Item: {
      "login": login,
      "operation": operation,
      "type": type,
      "user": user,
      "timestamp": timestamp
    }
  };

  docClient.put(params, function(err, data) {
    if (err)
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
  });
}