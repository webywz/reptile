const { post, ERR_OK, getRandomVal } = require('./API')

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

function album (req, res) {
    const data = {
        req_0: {
            module: 'srf_diss_info.DissInfoServer',
            method: 'CgiGetDiss',
            param: {
                disstid: Number(req.query.id),
                onlysonglist: 1,
                song_begin: 0,
                song_num: 100
            }
        },
        comm: {
            g_tk: token,
            uin: '0',
            format: 'json',
            platform: 'h5'
        }
    }
    const sign = getSecuritySign(JSON.stringify(data))
    const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${getRandomVal()}&sign=${sign}`
    post(url, data).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
            const list = data.req_0.data.songlist
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
module.exports = album
