'use strict'

const request = require('request');

const STATUS_PENDING = 'pending'
const STATUS_RUNNNING = 'running'
const STATUS_DONE = 'done'
const STATUS_FAILED = 'failed'
const STATUS_CANCELED = 'canceled'
const STATUS_UNKNOWN = 'unknown'

const READ_DELAY = 1000


module.exports = class Client {
    constructor(username, apiKey) {
        this.username = username
        this.apiKey = apiKey
    }

    async batch(query) {
        const job = await this._create(query);
        if (![STATUS_PENDING, STATUS_RUNNNING].includes(job.status) || !job.job_id) {
            throw new Error('Something goes wrong')
        }

        const jobRead = await this._readRecursive(job.job_id);
    }

    _create(query) {
        const options = this._getCallOptions({ body: { query } })
        return this._call(options)
    }

    _readRecursive(jobId) {
        const options = this._getCallOptions({ jobId, method: 'GET' })
        const job = this._call(options)
        if ([STATUS_PENDING, STATUS_RUNNNING].includes(job.status)) {
            // TODO: retry algorithm
            setTimeout(this._readRecursive(jobId), READ_DELAY)
        }
    }

    _call(options) {
        return new Promise((resolve, reject) => {
            request(options, function (error, response, body) {
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

