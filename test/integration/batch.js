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
        const response = await this.client.batch(query)
        assert.equal(response, '1234')
    });
});
