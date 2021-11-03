const { get, ERR_OK, getRandomVal, token } = require('./API')
// 获取签名方法
const getSecuritySign = require('./sign')
const Base64 = require('js-base64').Base64

function lyric(req, res) {
    const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
    get(url, {
        '-': 'MusicJsonCallback_lrc',
        pcachetime: +new Date(),
        songmid: req.query.mid,
        g_tk_new_20200303: token
    }).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
            res.json({
                code: ERR_OK,
                result: {
                    lyric: Base64.decode(data.lyric)
                }
            })
        } else {
            res.json(data)
        }
    })
}

module.exports = lyric
