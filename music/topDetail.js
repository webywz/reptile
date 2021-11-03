const { get, ERR_OK, getRandomVal } = require('./API')

// 获取签名方法
const getSecuritySign = require('./sign')

// 处理歌曲列表
function handleSongList(list) {
    const songList = []

    list.forEach((item) => {
        const info = item.songInfo || item
        if (info.pay.pay_play !== 0 || !info.interval) {
            // 过滤付费歌曲和获取不到时长的歌曲
            return
        }

        // 构造歌曲的数据结构
        const song = {
            id: info.id,
            mid: info.mid,
            name: info.name,
            singer: mergeSinger(info.singer),
            url: '', // 在另一个接口获取
            duration: info.interval,
            pic: info.album.mid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${info.album.mid}.jpg?max_age=2592000` : fallbackPicUrl,
            album: info.album.name
        }

        songList.push(song)
    })

    return songList
}
// 合并多个歌手的姓名
function mergeSinger(singer) {
    const ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}

function topDetail (req, res) {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
    const { id, period } = req.query

    const data = JSON.stringify({
        detail: {
            module: 'musicToplist.ToplistInfoServer',
            method: 'GetDetail',
            param: {
                topId: Number(id),
                offset: 0,
                num: 100,
                period
            }
        },
        comm: {
            ct: 24,
            cv: 0
        }
    })

    const randomKey = getRandomVal('getUCGI')
    const sign = getSecuritySign(data)

    get(url, {
        sign,
        '-': randomKey,
        data
    }).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
            const list = data.detail.data.songInfoList
            const songList = handleSongList(list)

            res.json({
                code: ERR_OK,
                result: {
                    songs: songList
                }
            })
        } else {
            res.json(data)
        }
    })
}

module.exports = topDetail
