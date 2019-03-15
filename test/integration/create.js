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
        const response = await this.client._create(query)
        assert.equal(response.user, parameters.username)
        assert.equal(response.query, query)
        assert.equal(response.status, 'pending')
    });

    it('creates several querys', async function () {
        const query = [
            'SELECT 1',
            'SELECT 2',
            'SELECT 3',
            'SELECT 4'
        ]
        const response = await this.client._create(query)
        assert.equal(response.user, parameters.username)
        assert.deepEqual(response.query, [
            {
                "query": "SELECT 1",
                "status": "pending"
            },
            {
                "query": "SELECT 2",
                "status": "pending"
            },
            {
                "query": "SELECT 3",
                "status": "pending"
            },
            {
                "query": "SELECT 4",
                "status": "pending"
            }
        ])
        assert.equal(response.status, 'pending')
    });
});
