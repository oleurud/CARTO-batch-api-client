const assert = require('assert');
const parameters = require('../../parameters')
const Client = require('../../index')

describe('auth', function () {
    it(`fails with wrong apikey: ''`, async function () {
        client = new Client(parameters.username, '')

        await client.batch().catch(error => {
            assert.deepEqual(error, {
                error: ['permission denied']
            })
        })
    });

    [undefined, null, 'fake-api-key'].forEach(apikey => {
        it(`fails with wrong apikey: ${apikey}`, async function () {
            client = new Client(parameters.username, apikey)

            await client.batch().catch(error => {
                assert.deepEqual(error, {
                    error: ['Unauthorized']
                })
            })
        });
    })
});
