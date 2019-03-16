# CARTO Batch API client

A client for making the [CARTO Batch API](https://carto.com/developers/sql-api/guides/batch-queries) synchronous. The client creates the job, checks when it is completed and finally, returns a Promise with the job.


## Basic usage

```javascript
const client = new Client(`your username`, `your master apikey`)

const query = "INSERT INTO ..."
const job = await client.batch(query)
```

The `batch` method returns a promise with the job finished. For example, you could have in `job`:

```javascript
{
    job_id: "b71fx4f5-2x4x-486d-9xb6-a9c7x6584fd3",
    user: "your username",
    status: "done",
    query: "INSERT INTO ...",
    created_at: "2019-03-16T17:20:05.765Z",
    updated_at: "2019-03-16T17:20:05.785Z"
}
```


## Chaining Batch Queries

In order to execute chaining Batch API queries, you should send an array of chained batch queries to the `batch` method:

```javascript
const queries = [
    "CREATE TABLE ...",
    "INSERT INTO ...",
    "UPDATE ...",
]
const job = await client.batch(queries)
```

As a result, you will receive:
```javascript
{
    job_id: "b71fx4f5-2x4x-486d-9xb6-a9c7x6584fd3",
    user: "your username",
    status: "done",
    query: [
        {
            query: "CREATE TABLE ...",
            status: "done"
        },
        {
            query: "INSERT INTO ...",
            status: "done"
        },
        {
            query: "UPDATE ...",
            status: "done"
        }
    ],
    created_at: "2019-03-16T17:20:05.765Z",
    updated_at: "2019-03-16T17:20:05.785Z"
}
```


## Chaining Batch Queries with fallbacks

In order to use chaining Batch API queries with fallbacks, you should send an object similar to the following one to the `batch` method:

```javascript
const queries = {
    query: [
        {
            query: "INSERT ...",
            onsuccess: "UPDATE ...",
            onerror: "DELETE ..."
        },
        {
            query: "UPDATE ...",
            onsuccess: "INSERT ...",
            onerror: "INSERT ..."
        }
    ],
    onsuccess: "UPDATE ...",
    onerror: "UPDATE ..."
}
const job = await client.batch(queries)
```

As a result, you will receive:

```javascript
{
    job_id: "b71fx4f5-2x4x-486d-9xb6-a9c7x6584fd3",
    user: "your username",
    status: "done",
    query: {
        query: [
            {
                query: "INSERT ...",
                onsuccess: "UPDATE ...",
                onerror: "DELETE ...",
                status: "done",
                fallback_status: "done",
                started_at: "2019-03-16T17:55:56.891Z",
                ended_at: "2019-03-16T17:55:56.900Z"
            },
            {
                query: "UPDATE ...",
                onsuccess: "INSERT ...",
                onerror: "INSERT ...",
                status: "done",
                fallback_status: "done",
                started_at: "2019-03-16T17:55:56.922Z",
                ended_at: "2019-03-16T17:55:56.925Z"
            }
        ],
        onsuccess: "UPDATE ...",
        onerror: "UPDATE ..."
    },
    created_at: "2019-03-16T17:20:05.765Z",
    updated_at: "2019-03-16T17:20:05.785Z"
}
```

## Errors

The client returns the error in a similar fashion as the Batch API. For example, if you tries to create a job with a wrong query:

```javascript
const query = "WRONG QUERY"
const job = await client.batch(query)
```

`job` will be:

```javascript
{
    job_id: "b71fx4f5-2x4x-486d-9xb6-a9c7x6584fd3",
    user: "your username",
    status: "failed",
    query: 'wrong query',
    created_at: '2019-03-16T18:24:10.260Z',
    updated_at: '2019-03-16T18:24:10.282Z',
    failed_reason: 'syntax error at or near "wrong"'
}
```

Also, if you don't configure the Client in a proper way or you don't send a query:
```javascript
const error = await client.batch() # no query!

`{ error: [ 'You must indicate a valid SQL' ] }`
```

```javascript
const client = new Client(`your username`) # no API key

const query = "INSERT INTO ..."
const error = await client.batch(query)

`{ error: [ 'Unauthorized' ] }`
```

## Testing and developing

You will need to create a `parameters.json` file with your credentials

```bash
cp parameters.example.json parameters.json
vim parameters.json
```

To run tests:
```bash
npm test
o
npm run dev-test (with watcher and logs)
```
