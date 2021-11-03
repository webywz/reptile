const { get, ERR_OK, getRandomVal, token } = require('./API')

// 获取签名方法
const getSecuritySign = require('./sign')

function hotKeys (res) {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    get(url, {
        g_tk_new_20200303: token
    }).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
            res.json({
                code: ERR_OK,
                result: {
                    hotKeys: data.data.hotkey.map((key) => {
                        return {
                            key: key.k,
                            id: key.n
                        }
                    }).slice(0, 10)
                }
            })
        } else {
            res.json(data)
        }
    })
}

module.exports = hotKeys
