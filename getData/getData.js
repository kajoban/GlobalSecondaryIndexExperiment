var AWS = require('aws-sdk');
var { v4: uuidv4 } = require('uuid');

var ddb = new AWS.DynamoDB();

/*
Since our primary key is a uuid,
we can randomly retrieve an item by starting a scan
from a random uuid, and limiting the result to 1 item
*/
exports.handler = async (event) => {
    var params = {
        TableName: 'kajoban-order-data-table-1',
        Limit: 1,
        ExclusiveStartKey: {
            "OrderID": { "S": uuidv4() }
        },
    };

    return await ddb.scan(params).promise();
}


