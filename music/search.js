const { get, ERR_OK, getRandomVal, token } = require('./API')

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

function search (req, res) {
    const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

    const { query, page, showSinger } = req.query

    const data = {
        _: getRandomVal(),
        g_tk_new_20200303: token,
        w: query,
        p: page,
        perpage: 20,
        n: 20,
        zhidaqu: 1,
        catZhida: showSinger === 'true' ? 1 : 0,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        remoteplace: 'txt.mqq.all',
        uin: '0',
        needNewCode: 1,
        platform: 'h5',
        format: 'json'
    }

    get(url, data).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
            const songList = []
            const songData = data.data.song
            const list = songData.list

            list.forEach((item) => {
                const info = item
                if (info.pay.payplay !== 0 || !info.interval) {
                    // 过滤付费歌曲
                    return
                }

                const song = {
                    id: info.songid,
                    mid: info.songmid,
                    name: info.songname,
                    singer: mergeSinger(info.singer),
                    url: '',
                    duration: info.interval,
                    pic: info.albummid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${info.albummid}.jpg?max_age=2592000` : fallbackPicUrl,
                    album: info.albumname
                }
                songList.push(song)
            })

            let singer
            const zhida = data.data.zhida
            if (zhida && zhida.type === 2) {
                singer = {
                    id: zhida.singerid,
                    mid: zhida.singermid,
                    name: zhida.singername,
                    pic: `https://y.gtimg.cn/music/photo_new/T001R800x800M000${zhida.singermid}.jpg?max_age=2592000`
                }
            }

            const { curnum, curpage, totalnum } = songData
            const hasMore = 20 * (curpage - 1) + curnum < totalnum

            res.json({
                code: ERR_OK,
                result: {
                    songs: songList,
                    singer,
                    hasMore
                }
            })
        } else {
            res.json(data)
        }
    }).catch((e) => {
        res.status(500).send()
    })
}
module.exports = search
