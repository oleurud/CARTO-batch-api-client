const assert = require('assert');
const parameters = require('../../parameters')
const Client = require('../../index')

describe('batch', function () {
    before(function () {
        this.client = new Client(parameters.username, parameters.apikey)
    });

    it('fails without query', async function () {
        await this.client.batch().catch(error => {
            assert.deepEqual(error, {
                error: ['You must indicate a valid SQL']
            })
        })
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
                "query": "SELECT 1",
                "status": "done"
            },
            {
                "query": "SELECT 2",
                "status": "done"
            }
        ])
        assert.equal(job.status, 'done')
    });
});
