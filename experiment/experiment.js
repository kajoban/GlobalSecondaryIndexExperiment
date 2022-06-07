const {
    performance
} = require('perf_hooks');
var AWS = require('aws-sdk');
const { handler: getItem } = require('./getItem');

var ddb = new AWS.DynamoDB();

exports.handler = async (event) => {
    const numberOfSamples = 1;
    for (let i = 0; i < numberOfSamples; i++) {
        // get a random DispatchDate
        const item = await getItem()
        const dispatchDate = item["Items"][0]["DispatchDate"]["S"]

        // time scan on DispatchDate
        var scanParams = {
            TableName: 'kajoban-order-data-table-1',
            FilterExpression: "#DispatchDate = :dispatchDate",
            ExpressionAttributeNames: { "#DispatchDate": "DispatchDate" },
            ExpressionAttributeValues: {
                ':dispatchDate': { "S": dispatchDate }
            }
        };
        const scanStartTime = performance.now();
        await ddb.scan(scanParams).promise()
        const scanEndTime = performance.now()
        const scanElapsedTime = (scanEndTime - scanStartTime)
        console.log(`scan of ${dispatchDate} took ${scanElapsedTime} milliseconds`)

        // time of query on DispatchDate 
        const queryParams = {
            TableName: 'kajoban-order-data-table-1',
            IndexName: 'DispatchDate',
            KeyConditionExpression: 'DispatchDate = :dispatchDate',
            ExpressionAttributeValues: {
                ':dispatchDate': { "S": dispatchDate },
            },
        };
        const queryStartTime = performance.now();
        await ddb.query(queryParams).promise()
        const queryEndTime = performance.now()
        const queryElapsedTime = (queryEndTime - queryStartTime)
        console.log(`query of ${dispatchDate} took ${queryElapsedTime} milliseconds`)
    }
}
