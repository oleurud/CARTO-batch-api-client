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

    it('create one query', async function () {
        const query = 'SELECT 1234'
        const job = await this.client.batch(query)
        assert.equal(job.user, parameters.username)
        assert.equal(job.query, query)
        assert.equal(job.status, 'done')
    });

    it('create one query with delay', async function () {
        const query = 'SELECT pg_sleep(0.15)'
        const job = await this.client.batch(query)
        assert.equal(job.user, parameters.username)
        assert.equal(job.query, query)
        assert.equal(job.status, 'done')
    });
});
