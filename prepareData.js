var AWS = require('aws-sdk');
var { v4: uuidv4 } = require('uuid');
var moment = require('moment');

// to upload to lambda:
// zip -r prepareData.zip .
exports.handler = async (event) => {
    console.log("preparing data");

    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

    var params = {
        RequestItems: {
            'kajoban-order-data-table-1': createPutRequestList()
        }
    }

    console.log(`inserting item ${JSON.stringify(params.RequestItems, null, 2)}`);

    await ddb.batchWriteItem(params, function (err, data) {
        if (err) {
            console.log("Error: ", err)
        } else {
            console.log("Success: ", data)
        }
    }).promise()
};

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