const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const ddb = new AWS.DynamoDB();

/*
Since our primary key is a uuid,
we can randomly retrieve an item by starting a scan
from a random uuid, and limiting the result to 1 item

Read more: https://stackoverflow.com/questions/10666364/aws-dynamodb-pick-a-record-item-randomly
*/
exports.handler = async (event) => {
    const params = {
        TableName: "kajoban-order-data-table-1",
        Limit: 1,
        ExclusiveStartKey: {
            OrderID: { S: uuidv4() },
        },
    };

    return await ddb.scan(params).promise();
};
