let express = require('express')
let router = express.Router()
const urlLib = require('url')
// 在 axios 请求时，选择性忽略 SSL
const https = require('https')
const StreamZip = require('node-stream-zip')
const fs = require('fs')
const axios = require('axios')
const download = require('download')
const agent = new https.Agent({
  rejectUnauthorized: false,
})

router.get('/search', async (req, res, next) => {
  const content = urlLib.parse(req.url, true).query.keyword
  const page = urlLib.parse(req.url, true).query.page || 1
  let result = await axios.get(
    `https://api.diwudianqi6.cn/api/v1/novelsearch?content=${content}&pageIndex=${page}&pageSize=20&type=2`
  )
  res.json({ search: result.data })
})

router.get('/file', async (req, res, next) => {
  const fileTopic = urlLib.parse(req.url, true).query.topic
  const fileName = urlLib.parse(req.url, true).query.file
  fs.writeFileSync(
    `./contents/${fileName}.zip`,
    await download(`http://statics.rungean.com/static/book/zip/${fileTopic}/${fileName}.zip`)
  )
  const zip = new StreamZip({ file: `./contents/${fileName}.zip`, storeEntries: true })
  //解压所有文件
  zip.on('ready', () => {
    fs.exists(`./contents/${fileName}`, async (exists) => {
      if (exists) {
        res.json({ msg: '文件存在' })
      }
      if (!exists) {
        fs.mkdirSync(`./contents/${fileName}`)
        zip.extract(null, `./contents/${fileName}`, (err, count) => {
          console.log(err ? 'Extract error' : `Extracted ${count} entries`, count, '==============')
          zip.close()
          fs.unlinkSync(`./contents/${fileName}.zip`)
          res.json({ msg: '创建文件夹' })
        })
      }
    })
  })
})

router.get('/detail', async (req, res, next) => {
  const fileName = urlLib.parse(req.url, true).query.file
  const JSONStr = {}
  fs.readFile(`./contents/${fileName}/detail.json`, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    JSONStr.detail = data
    res.json({ detail: JSON.parse(JSONStr.detail) })
  })
})

router.get('/chapter', async (req, res, next) => {
  const JSONStr = {}
  const fileName = urlLib.parse(req.url, true).query.file
  fs.readFile(`./contents/${fileName}/chapter.json`, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    JSONStr.chapter = data
    res.json({ chapter: JSON.parse(JSONStr.chapter) })
  })
})

function deleteall(path) {
  var files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file, index) {
      var curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteall(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
router.get('/del', async (req, res, next) => {
  const fileName = urlLib.parse(req.url, true).query.file
  deleteall(`./${fileName}`)
  res.json({ msg: '删除成功' })
})

router.get('/content', async (req, res, next) => {
  const url = urlLib.parse(req.url, true).query.url
  let result = await axios.get(url)
  res.json({ res: result.data })
})

// 人气
router.get('/popularity', async (req, res, next) => {
  let result = await axios.get('http://statics.rungean.com/static/ranking/15/1/popularity.json')
  res.json({ popularity: result.data })
})

// 推荐
router.get('/reco', async (req, res, next) => {
  let result = await axios.get('http://statics.rungean.com/static/ranking/15/1/reco.json')
  res.json({ reco: result.data })
})

// 收藏
router.get('/collect', async (req, res, next) => {
  let result = await axios.get('http://statics.rungean.com/static/ranking/15/1/collect.json')
  res.json({ collect: result.data })
})

// 热搜
router.get('/hotsearch', async (req, res, next) => {
  let result = await axios.get('http://statics.rungean.com/static/ranking/15/1/hotsearch.json')
  res.json({ hotsearch: result.data })
})

//分类1
router.get('/class1', async (req, res, next) => {
  let result = await axios.get('http://statics.rungean.com/static/category/15/1/all.json')
  res.json({ class1: result.data })
})

//分类2
router.get('/class2', async (req, res, next) => {
  let result = await axios.get('http://statics.rungean.com/static/category/15/2/all.json')
  res.json({ class2: result.data })
})

//分类列表
router.get('/classList', async (req, res, next) => {
  const classId = urlLib.parse(req.url, true).query.id
  const className = urlLib.parse(req.url, true).query.name
  const page = urlLib.parse(req.url, true).query.page
  let result = await axios.get(
    `http://statics.rungean.com/static/book/category/15/${classId}/${className}/${page}.json`
  )
  res.json({ list: result.data })
})

module.exports = router
