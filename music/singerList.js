const { get, ERR_OK, getRandomVal } = require('./API')
const pinyin = require('pinyin')
// 获取签名方法
const getSecuritySign = require('./sign')
// 注册歌手列表接口路由
function singerList() {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
    const HOT_NAME = '热'

    const data = JSON.stringify({
        comm: { ct: 24, cv: 0 },
        singerList: {
            module: 'Music.SingerListServer',
            method: 'get_singer_list',
            param: { area: -100, sex: -100, genre: -100, index: -100, sin: 0, cur_page: 1 }
        }
    })

    const randomKey = getRandomVal('getUCGI')
    const sign = getSecuritySign(data)
    return new Promise((resolve, reject) => {
        get(url, {
            sign,
            '-': randomKey,
            data
        }).then((response) => {
            const data = response.data
            if (data.code === ERR_OK) {
                // 处理歌手列表数据
                let singerList = data.singerList.data.singerlist

                // 构造歌手 Map 数据结构
                const singerMap = {
                    hot: {
                        title: HOT_NAME,
                        list: map(singerList.slice(0, 10))
                    }
                }

                singerList.forEach((item) => {
                    // 把歌手名转成拼音
                    const p = pinyin(item.singer_name)
                    if (!p || !p.length) {
                        return
                    }
                    // 获取歌手名拼音的首字母
                    const key = p[0][0].slice(0, 1).toUpperCase()
                    if (key) {
                        if (!singerMap[key]) {
                            singerMap[key] = {
                                title: key,
                                list: []
                            }
                        }
                        // 每个字母下面会有多名歌手
                        singerMap[key].list.push(map([item])[0])
                    }
                })

                // 热门歌手
                const hot = []
                // 字母歌手
                const letter = []

                // 遍历处理 singerMap，让结果有序
                for (const key in singerMap) {
                    const item = singerMap[key]
                    if (item.title.match(/[a-zA-Z]/)) {
                        letter.push(item)
                    } else if (item.title === HOT_NAME) {
                        hot.push(item)
                    }
                }
                // 按字母顺序排序
                letter.sort((a, b) => {
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0)
                })
                resolve(hot.concat(letter))
            } else {
                reject('失败')
                console.log('爬取失败')
            }
        })
    })


    // 做一层数据映射，构造单个 singer 数据结构
    function map(singerList) {
        return singerList.map((item) => {
            return {
                id: item.singer_id,
                mid: item.singer_mid,
                name: item.singer_name,
                pic: item.singer_pic.replace(/\.webp$/, '.jpg').replace('150x150', '800x800')
            }
        })
    }
}

module.exports = singerList
