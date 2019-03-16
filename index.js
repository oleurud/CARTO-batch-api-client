'use strict'

const request = require('request');
const debug = require('debug')('carto-batch-api-client')

const STATUS_PENDING = 'pending'
const STATUS_RUNNNING = 'running'
const STATUS_DONE = 'done'
const STATUS_FAILED = 'failed'
const STATUS_CANCELLED = 'cancelled'
const STATUS_UNKNOWN = 'unknown'

let READ_RETRY_DELAY = 100

module.exports = class Client {
    constructor(username, apiKey) {
        this.username = username
        this.apiKey = apiKey
    }

    async batch(query) {
        const job = await this._create(query).catch(error => error)

        if (job.error) {
            return job
        }

        if (![STATUS_PENDING, STATUS_RUNNNING].includes(job.status) || !job.job_id) {
            return { error: 'Something goes wrong' }
        }

        return this._readRecursive(job.job_id).catch(error => error);
    }

    _create(query) {
        const options = this._getCallOptions({ body: { query } })
        return this._call(options)
    }

    async _readRecursive(jobId, retry_delay = READ_RETRY_DELAY) {
        const options = this._getCallOptions({ jobId, method: 'GET' })
        const job = await this._call(options)

        debug('_readRecursive', job.status)

        if (job.status === STATUS_DONE) {
            return Promise.resolve(job)
        }

        if ([STATUS_FAILED, STATUS_CANCELLED, STATUS_UNKNOWN].includes(job.status)) {
            return Promise.reject(job)
        }

        if ([STATUS_PENDING, STATUS_RUNNNING].includes(job.status)) {
            await new Promise(resolve => setTimeout(resolve, retry_delay));
            return this._readRecursive(jobId, retry_delay * 2)
        }
    }

    _call(options) {
        return new Promise((resolve, reject) => {
            const initTime = new Date();
            request(options, function (error, response, body) {
                debug('_call', `Response time: ${new Date() - initTime}ms`)

                if (error) {
                    return reject(error)
                }

                if (response.statusCode >= 400) {
                    return reject(body)
                }

                return resolve(body)
            });
        })
    }

    _getCallOptions({ jobId, body = {}, method = "POST" }) {
        let url = `https://${this.username}.carto.com/api/v2/sql/job?api_key=${this.apiKey}`
        if (jobId) {
            url = `https://${this.username}.carto.com/api/v2/sql/job/${jobId}?api_key=${this.apiKey}`
        }

        return {
            url,
            method,
            headers: {
                "content-type": "application/json"
            },
            json: true,
            body
        }
    }
}
