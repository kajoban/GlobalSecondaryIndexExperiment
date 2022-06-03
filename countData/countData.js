var AWS = require('aws-sdk');

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = async (event) => {
    const tableName = "kajoban-order-data-table-1"
    const data = await ddb.scan({ Select: "COUNT", TableName: tableName }).promise();
    return `there are ${data.Count} items in ${tableName}`;
};
