# CARTO Batch API client

A lib for making the [CARTO Batch API](https://carto.com/developers/sql-api/guides/batch-queries) synchronous.


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

