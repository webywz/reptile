const axios = require('axios')
// 对 axios get 请求的封装
// 修改请求的 headers 值，合并公共请求参数
function get(url, params) {
    return axios.get(url, {
        headers: {
            referer: 'https://y.qq.com/',
            origin: 'https://y.qq.com/'
        },
        params: Object.assign({}, commonParams, params)
    })
}

// 对 axios post 请求的封装
// 修改请求的 headers 值
function post(url, params) {
    return axios.post(url, params, {
        headers: {
            referer: 'https://y.qq.com/',
            origin: 'https://y.qq.com/',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

// 获取一个随机数值
function getRandomVal(prefix = '') {
    return prefix + (Math.random() + '').replace('0.', '')
}
const ERR_OK = 0
const token = 5381
// 公共参数
const commonParams = {
    g_tk: token,
    loginUin: 0,
    hostUin: 0,
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    needNewCode: 0,
    format: 'json',
    platform: 'yqq.json'
}


// 获取一个随机 uid
function getUid() {
    const t = (new Date()).getUTCMilliseconds()
    return '' + Math.round(2147483647 * Math.random()) * t % 1e10
}


module.exports = {
    get,
    post,
    getRandomVal,
    getUid,
    commonParams,
    token,
    ERR_OK
}
