const assert = require('assert');
const parameters = require('../../parameters')
const Client = require('../../index')

describe('batch', function () {
    before(function () {
        this.client = new Client(parameters.username, parameters.apikey)
    });

    it('fails without query', async function () {
        const response = await this.client.batch()
        assert.deepEqual(response, {
            error: ['You must indicate a valid SQL']
        })
    });

    it('fails with wrong query', async function () {
        const query = 'wrong query'
        const job = await this.client.batch(query)
        assert.equal(job.user, parameters.username)
        assert.equal(job.query, query)
        assert.equal(job.status, 'failed')
        assert.equal(job.failed_reason, 'syntax error at or near "wrong"')
    });

    it('batch one query', async function () {
        const query = 'SELECT 1234'
        const job = await this.client.batch(query)
        assert.equal(job.user, parameters.username)
        assert.equal(job.query, query)
        assert.equal(job.status, 'done')
    });

    it('batch one query with delay', async function () {
        const query = 'SELECT pg_sleep(0.15)'
        const job = await this.client.batch(query)
        assert.equal(job.user, parameters.username)
        assert.equal(job.query, query)
        assert.equal(job.status, 'done')
    });

    it('batch several queries', async function () {
        const queries = [
            'SELECT 1',
            'SELECT 2'
        ]
        const job = await this.client.batch(queries)
        assert.equal(job.user, parameters.username)
        assert.deepEqual(job.query, [
            {
                query: "SELECT 1",
                status: "done"
            },
            {
                query: "SELECT 2",
                status: "done"
            }
        ])
        assert.equal(job.status, 'done')
    });

    it('fails with right and wrong queries', async function () {
        const queries = [
            'SELECT 1',
            'wrong query'
        ]
        const job = await this.client.batch(queries)
        assert.equal(job.user, parameters.username)
        assert.deepEqual(job.query, [
            {
                query: "SELECT 1",
                status: "done"
            },
            {
                query: "wrong query",
                status: "failed",
                failed_reason: 'syntax error at or near "wrong"'
            }
        ])
        assert.equal(job.status, 'failed')
        assert.equal(job.failed_reason, 'syntax error at or near "wrong"')
    });

    it('batch several queries with fallbacks', async function () {
        const queries = {
            query: [
                {
                    query: "SELECT 1",
                    onsuccess: "SELECT 2",
                    onerror: "SELECT 3"
                },
                {
                    query: "SELECT 4",
                    onsuccess: "SELECT 5",
                    onerror: "SELECT 6"
                }
            ],
            onsuccess: "SELECT 7",
            onerror: "SELECT 8"
        }
        const job = await this.client.batch(queries)

        assert.equal(job.user, parameters.username)
        assert.equal(job.query.query.length, 2);

        assert.equal(job.query.onsuccess, "SELECT 7");
        assert.equal(job.query.onerror, "SELECT 8");

        assert.equal(job.query.query[0].query, "SELECT 1");
        assert.equal(job.query.query[0].onsuccess, "SELECT 2");
        assert.equal(job.query.query[0].onerror, "SELECT 3");

        assert.equal(job.query.query[1].query, "SELECT 4");
        assert.equal(job.query.query[1].onsuccess, "SELECT 5");
        assert.equal(job.query.query[1].onerror, "SELECT 6");

        assert.equal(job.status, 'done')
    });
});
