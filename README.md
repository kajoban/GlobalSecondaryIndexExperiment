# GlobalSecondaryIndexExperiment
Source code for GSI Query vs. Scan on DynamoDB table experiment. Read about the outcome on SSENSE's tech blog!

## prepareDate

Sample event JSON:
```
{
  "tableName": "example-order-table",
  "concurrentRequests": 40,
  "numberOfPutRequests": 25,
  "sequentialWrites": 100
}
```

Source code for Lambda that will concurrently batch insert random items into a specified DynamoDB table.
DynamoDB table should already exist, and Lambda needs permissions for writing to table and should point to `prepareData.js`. 

In order to upload Lambda:
1. cd into `/prepareData`
2. run `npm install` to install dependencies
3. run `zip -r prepareData.zip .` to create zip file of source code
4. upload zip file to Lambda 

## experiment 

Sample event JSON:
```
{
  "tableName": "example-order-table",
  "numberOfSamples": 50
}
```

Source code for Lambda that will choose 50 random items from a designated DynamoDB table, time a Query and Scan for
each item, and log the individual response times, as well as the average response time of all items upon completion. 
DynamoDB table should already exist, and Lambda needs permissions for reading from table and should point to `experiment.js`.

In order to upload Lambda:
1. cd into `/experiment`
2. run `npm install` to install dependencies
3. run `zip -r experiment.zip .` to create zip file of source code
4. upload zip file to Lambda
