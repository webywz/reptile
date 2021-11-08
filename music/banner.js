const axios = require('axios')
const { exec } = require('../db/mysql')
const { getRandomVal, commonParams } = require('./API')

// 获取签名方法
const getSecuritySign = require('./sign')
function banner() {
  // 第三方服务接口 url
  const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

  // 构造请求 data 参数
  const data = JSON.stringify({
    comm: { ct: 24 },
    recomPlaylist: {
      method: 'get_hot_recommend',
      param: { async: 1, cmd: 2 },
      module: 'playlist.HotRecommendServer',
    },
    focus: { module: 'music.musicHall.MusicHallPlatform', method: 'GetFocus', param: {} },
  })

  // 随机数值
  const randomVal = getRandomVal('recom')
  // 计算签名值
  const sign = getSecuritySign(data)

  axios
    .get(url, {
      headers: {
        referer: 'https://y.qq.com/',
        origin: 'https://y.qq.com/',
      },
      params: {
        sign,
        '-': randomVal,
        data,
        commonParams,
      },
    })
    .then((res) => {
      const data = res.data
      if (data.code === 0) {
        // 处理轮播图数据
        const focusList = data.focus.data.shelf.v_niche[0].v_card
        const sliders = []
        const jumpPrefixMap = {
          10002: 'https://y.qq.com/n/yqq/album/',
          10014: 'https://y.qq.com/n/yqq/playlist/',
          10012: 'https://y.qq.com/n/yqq/mv/v/',
        }
        // 最多获取 10 条数据
        const len = Math.min(focusList.length, 10)
        for (let i = 0; i < len; i++) {
          const item = focusList[i]
          const sliderItem = {}
          // 单个轮播图数据包括 id、pic、link 等字段
          sliderItem.id = item.miscellany.CfgID
          sliderItem.pic = item.cover
          if (jumpPrefixMap[item.jumptype]) {
            sliderItem.link = jumpPrefixMap[item.jumptype] + (item.subid || item.id) + '.html'
          } else if (item.jumptype === 3001) {
            sliderItem.link = item.id
          }
          sliders.push(sliderItem)
        }
        // 处理轮播图数据
        let addSql
        sliders.map((item) => {
          addSql = `REPLACE INTO banner(id,pic,link) VALUES('${item.id}','${item.pic}','${item.link}')`
          exec(addSql).then((r) => {})
        })

        // 歌单数据
        const albumList = data.recomPlaylist.data.v_hot
        const albums = []
        for (let i = 0; i < albumList.length; i++) {
          const item = albumList[i]
          const albumItem = {}
          // 推荐歌单数据包括 id、username、title、pic 等字段
          albumItem.id = item.content_id
          albumItem.username = item.username
          albumItem.title = item.title
          albumItem.pic = item.cover
          albums.push(albumItem)
        }
        let albumsAddSql
        albums.map((item) => {
          albumsAddSql = `REPLACE INTO albums(id,username,title,pic) VALUES('${item.id}','${item.username}','${item.title}','${item.pic}')`
          exec(albumsAddSql).then((r) => {})
        })
      }
    })
}
module.exports = banner
