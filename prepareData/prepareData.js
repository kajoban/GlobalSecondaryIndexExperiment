var AWS = require('aws-sdk');
var { v4: uuidv4 } = require('uuid');
var moment = require('moment');

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = async (event) => {
    // run 40 concurrent ddb writes
    var concurrentRequests = 40;
    let requestPromises = []
    for (let i = 0; i < concurrentRequests; i++) {
        // each request batch writes 25 items
        requestPromises.push(createBatchWriteItemPromise())
    }
    await Promise.all(requestPromises);
};

// creates batch write of 25 items 
// returns a promise
createBatchWriteItemPromise = async () => {
    var params = {
        RequestItems: {
            'kajoban-order-data-table-1': createPutRequestList()
        }
    }

    return await ddb.batchWriteItem(params, function (err, data) {
        if (err) {
            console.log("Error: ", err)
        } else {
            console.log("Success: ", data)
        }
    }).promise()
}

createPutRequestList = () => {
    putRequestList = []
    for (let i = 0; i < 25; i++) {
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