const assert = require('assert');
const parameters = require('../../parameters')
const Client = require('../../index')

describe('create', function () {
    before(function () {
        this.client = new Client(parameters.username, parameters.apikey)
    });

    it('fails without query', async function () {
        await this.client._create().catch(error => {
            assert.deepEqual(error, {
                error: ['You must indicate a valid SQL']
            })
        })
    });

    it('creates one query', async function () {
        const query = 'SELECT 1234'
        const job = await this.client._create(query)
        assert.equal(job.user, parameters.username)
        assert.equal(job.query, query)
        assert.equal(job.status, 'pending')
    });

    it('creates several queries', async function () {
        const queries = [
            'SELECT 1',
            'SELECT 2'
        ]
        const job = await this.client._create(queries)
        assert.equal(job.user, parameters.username)
        assert.deepEqual(job.query, [
            {
                query: "SELECT 1",
                status: "pending"
            },
            {
                query: "SELECT 2",
                status: "pending"
            }
        ])
        assert.equal(job.status, 'pending')
    });
});
