var AWS = require('aws-sdk');
var { v4: uuidv4 } = require('uuid');
var moment = require('moment');

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

/*
Sample Event JSON:
{
  "concurrentRequests": 20,
  "numberOfPutRequests": 25,
  "sequentialWrites": 10
}
*/

exports.handler = async (event) => {
    // run 500 sequential writes
    let i;
    try {
        for (i = 0; i < event.sequentialWrites; i++) {
            console.log(`performing concurrent write # ${i}`)
            await performConcurrentWrite(event.concurrentRequests, event.numberOfPutRequests);
        }
        return `inserted ${i + 1 * event.concurrentRequests * event.numberOfPutRequests} items into table`;
    } catch (error) {
        console.log(error);
        return `inserted ${i + 1 * event.concurrentRequests * event.numberOfPutRequests} items into table`;
    }
};

// run 40 concurrent ddb writes
performConcurrentWrite = async (concurrentRequests, numberOfPutRequests) => {
    let batchWritePromises = []
    for (let i = 0; i < concurrentRequests; i++) {
        // each request batch writes items
        batchWritePromises.push(createBatchWriteItemPromise(numberOfPutRequests))
    }
    console.log(`created ${batchWritePromises.length} batch write promises`)
    await Promise.all(batchWritePromises).then(values => {
        console.log(`resolved ${batchWritePromises.length} batch write promises`);
    });
}

// creates batch write of 25 items 
// returns a promise
createBatchWriteItemPromise = async (numberOfPutRequests) => {
    var params = {
        RequestItems: {
            'kajoban-order-data-table-1': createPutRequestList(numberOfPutRequests)
        }
    }
    return await ddb.batchWriteItem(params).promise()
}

createPutRequestList = (numberOfPutRequests) => {
    putRequestList = []
    for (let i = 0; i < numberOfPutRequests; i++) {
        putRequestList.push(createPutRequest())
    }
    return putRequestList
}

createPutRequest = () => {
    return {
        PutRequest: {
            Item: {
                'OrderID': { S: uuidv4() },
                'Items': { L: createRandomItems() },
                'DispatchDate': { S: createRandomDate() }
            }
        }
    }
}

createRandomItems = () => {
    const itemsList = ['SHOES', 'PANTS', 'SHIRT', 'HAT'];
    const numberOfItems = Math.floor(Math.random() * itemsList.length) + 1;
    const orderItems = []
    for (let i = 0; i < numberOfItems; i++) {
        orderItems.push({
            S: itemsList[Math.floor(Math.random() * itemsList.length)]
        })
    }
    return orderItems
}

createRandomDate = () => {
    return moment(new Date(+(new Date()) - Math.floor(Math.random() * 10000000000))).format('DDMMYYYY');
}