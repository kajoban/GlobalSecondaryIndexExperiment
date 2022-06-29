const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

const ddb = new AWS.DynamoDB();

/*
Concurrently inserts random items
into a DynamoDB table

Sample Event JSON:
{
  "tableName": "example-order-table",
  "concurrentRequests": 40,
  "numberOfPutRequests": 25,
  "sequentialWrites": 100
}
*/
exports.handler = async (event) => {
    let i;
    try {
        for (i = 0; i < event.sequentialWrites; i++) {
            console.log(`performing concurrent write # ${i}`);
            await performConcurrentWrite(
                event.tableName,
                event.concurrentRequests,
                event.numberOfPutRequests
            );
        }
        return `inserted ${(i + 1) * event.concurrentRequests * event.numberOfPutRequests
            } items into table`;
    } catch (error) {
        return error;
    }
};

// run concurrent ddb writes
performConcurrentWrite = async (
    tableName,
    concurrentRequests,
    numberOfPutRequests
) => {
    let batchWritePromises = [];
    for (let i = 0; i < concurrentRequests; i++) {
        // each request batch writes items
        batchWritePromises.push(
            createBatchWriteItemPromise(tableName, numberOfPutRequests)
        );
    }
    console.log(`created ${batchWritePromises.length} batch write promises`);
    await Promise.all(batchWritePromises).then((values) => {
        console.log(`resolved ${batchWritePromises.length} batch write promises`);
    });
};

// creates batch write of items
// returns a promise
createBatchWriteItemPromise = (tableName, numberOfPutRequests) => {
    const params = {
        RequestItems: {
            tableName: createPutRequestList(numberOfPutRequests),
        },
    };
    return ddb.batchWriteItem(params).promise();
};

createPutRequestList = (numberOfPutRequests) => {
    putRequestList = [];
    for (let i = 0; i < numberOfPutRequests; i++) {
        putRequestList.push(createPutRequest());
    }
    return putRequestList;
};

createPutRequest = () => {
    return {
        PutRequest: {
            Item: {
                OrderID: { S: uuidv4() },
                Items: { L: createRandomItems() },
                DispatchDate: { S: createRandomDate() },
            },
        },
    };
};

createRandomItems = () => {
    const itemsList = ["SHOES", "PANTS", "SHIRT", "HAT"];
    const numberOfItems = Math.floor(Math.random() * itemsList.length) + 1;
    const orderItems = [];
    for (let i = 0; i < numberOfItems; i++) {
        orderItems.push({
            S: itemsList[Math.floor(Math.random() * itemsList.length)],
        });
    }
    return orderItems;
};

createRandomDate = () => {
    return moment(
        new Date(+new Date() - Math.floor(Math.random() * 10000000000))
    ).format("DDMMYYYY");
};
