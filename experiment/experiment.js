const { performance } = require("perf_hooks");
const AWS = require("aws-sdk");
const { handler: getItem } = require("./getItem");

const ddb = new AWS.DynamoDB();

/*
Sample Event JSON:
{
  "tableName": "example-order-data-table",
  "numberOfSamples": 50
}
*/
exports.handler = async (event) => {
    const tableName = event.tableName;
    let scanTimes = [];
    let queryTimes = [];
    let items;
    for (let i = 0; i < event.numberOfSamples; i++) {
        // get a random DispatchDate
        const item = await getItem(event.tableName);
        const dispatchDate = item["Items"][0]["DispatchDate"]["S"];

        // time scan on DispatchDate
        let scanParams = {
            TableName: tableName,
            FilterExpression: "#DispatchDate = :dispatchDate",
            ExpressionAttributeNames: { "#DispatchDate": "DispatchDate" },
            ExpressionAttributeValues: {
                ":dispatchDate": { S: dispatchDate },
            },
        };
        const scanStartTime = performance.now();
        let scanRes = [];
        do {
            // paginated scan
            items = await ddb.scan(scanParams).promise();
            items.Items.map((item) => scanRes.push(item));
            scanParams.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");
        const scanEndTime = performance.now();
        const scanElapsedTime = scanEndTime - scanStartTime;
        console.log(
            `scan of ${dispatchDate} took ${scanElapsedTime} milliseconds and returned ${scanRes.length} items`
        );
        scanTimes.push(scanElapsedTime);

        // time of query on DispatchDate
        let queryParams = {
            TableName: tableName,
            IndexName: "DispatchDate-index",
            KeyConditionExpression: "DispatchDate = :dispatchDate",
            ExpressionAttributeValues: {
                ":dispatchDate": { S: dispatchDate },
            },
        };
        const queryStartTime = performance.now();
        let queryRes = [];
        do {
            // paginated query
            items = await ddb.query(queryParams).promise();
            items.Items.map((item) => queryRes.push(item));
            queryParams.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");
        const queryEndTime = performance.now();
        const queryElapsedTime = queryEndTime - queryStartTime;
        console.log(
            `query of ${dispatchDate} took ${queryElapsedTime} milliseconds and returned ${queryRes.length} items`
        );
        queryTimes.push(queryElapsedTime);
    }

    // compute average scan and query times
    console.log("===========================");
    console.log(
        `number of samples: ${event.numberOfSamples} from table ${tableName}`
    );
    console.log(
        `Average scan time per item: ${scanTimes.reduce((a, b) => a + b, 0) / scanTimes.length
        } milliseconds`
    );
    console.log(
        `Average query time per item: ${queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length
        } milliseconds`
    );
    console.log("===========================");
};
