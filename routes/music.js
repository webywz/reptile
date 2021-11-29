let express = require('express')
let router = express.Router()
const axios = require('axios')
// const { getBanner, getAlbums } = require('../controller/music')
const singerData = require('../music/singerList')
const singerDetail = require('../music/singerDetail')
const songsUrl = require('../music/songsUrl')
const lyric = require('../music/lyric')
const album = require('../music/album')
const topList = require('../music/topList')
const topDetail = require('../music/topDetail')
const hotKeys = require('../music/hotKeys')
const search = require('../music/search')
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// router.get('/music/banner', async (req, res, next) => {
//   const result = await getBanner()
//   return res.json(result)
// })
// router.get('/music/albums', async (req, res, next) => {
//   const result = await getAlbums()
//   res.json(result)
// })
router.get('/music/singerList', async (req, res, next) => {
  const result = await singerData()
  res.json(result)
})
router.get('/music/singerDetail', async (req, res, next) => {
  const result = await singerDetail(req)
  res.json(result)
})
router.get('/music/songsUrl', async (req, res, next) => {
  await songsUrl(req, res)
})
router.get('/music/lyric', async (req, res, next) => {
  await lyric(req, res)
})
router.get('/music/album', async (req, res, next) => {
  await album(req, res)
})
router.get('/music/topList', async (req, res, next) => {
  await topList(res)
})
router.get('/music/topDetail', async (req, res, next) => {
  await topDetail(req, res)
})
router.get('/music/hotKeys', async (req, res, next) => {
  await hotKeys(res)
})
router.get('/music/search', async (req, res, next) => {
  await search(req, res)
})

module.exports = router
