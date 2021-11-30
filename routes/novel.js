let express = require('express')
let router = express.Router()
const urlLib = require('url')
// 在 axios 请求时，选择性忽略 SSL
const https = require('https')
const StreamZip = require('node-stream-zip')
const fs = require('fs')
const path = require('path')
const request = require('request')
const axios = require('axios')
const JSZIP = require('jszip');
const zip = new JSZIP();
const download = require('download')
const agent = new https.Agent({
  rejectUnauthorized: false,
})

router.get('/search', async (req, res, next) => {
  const content = urlLib.parse(req.url, true).query.keyword
  const page = urlLib.parse(req.url, true).query.page || 1
  let url = `https://api.diwudianqi6.cn/api/v1/novelsearch?content=${content}&pageIndex=${page}&pageSize=20&type=2`
  let result = await axios.get(encodeURI(url))
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
        zip.close()
        fs.unlinkSync(`./contents/${fileName}.zip`)
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

/*
* url 网络文件地址
* filename 文件名
* callback 回调函数
*/
function downloadFile(uri,filename,callback){
  let stream = fs.createWriteStream(filename);
  request(uri).pipe(stream).on('close', callback);
}
router.get('/txt', async (req, res, next) => {
  const fileName = urlLib.parse(req.url, true).query.file
  const JSONStr = {}
  fs.mkdir(`./contents/${fileName}/txtFile`, () => {
    console.log('创建成功')
  })
  fs.readFile(`./contents/${fileName}/chapter.json`, 'utf8', async (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    JSONStr.chapter = data
    let i = 0
    for await (const item of JSON.parse(JSONStr.chapter).data) {
      i++
      try {
        downloadFile(item.content_url, `./contents/${fileName}/txtFile/${i}${item.name}.txt`, () => {
          console.log(`${i}${item.name}.txt`)
        })
      } catch (e) {
        console.log(e.config.url, "======================")
      }
    }
    res.json({ zipTxt: JSON.parse(JSONStr.chapter).data })
  })
})

router.get('/zip', async (req, res, next) => {
  const fileName = urlLib.parse(req.url, true).query.file
  const sourceDir = `./contents/${fileName}/txtFile`
  readDir(zip, sourceDir);
  zip.generateAsync({
    type: "nodebuffer", // 压缩类型
    compression: "DEFLATE", // 压缩算法
    compressionOptions: { // 压缩级别
      level: 9
    }
  }).then(content => {
    // 把zip包写到硬盘中，这个content现在是一段buffer
    fs.writeFileSync(`./contents/${fileName}/zipTxt.zip`, content);
    res.json({ zip: `http://file.web-ywz.top/${fileName}/zipTxt.zip` })
  }).catch(e => {
    console.log(e)
  });
})
function readDir(zip, dirPath) {
  // 读取dist下的根文件目录
  const files = fs.readdirSync(dirPath);
  files.forEach(fileName => {
    const fillPath = dirPath + "/" + fileName;
    const file = fs.statSync(fillPath);
    // 如果是文件夹的话需要递归遍历下面的子文件
    if (file.isDirectory()) {
      const dirZip = zip.folder(fileName);
      readDir(dirZip, fillPath);
    } else {
      // 读取每个文件为buffer存到zip中
      zip.file(fileName, fs.readFileSync(fillPath));
    }
  });
}
function generateZip(fileName) {
  const sourceDir = `./contents/${fileName}/zipTxt`
  readDir(zip, sourceDir);
  zip.generateAsync({
    type: "nodebuffer", // 压缩类型
    compression: "DEFLATE", // 压缩算法
    compressionOptions: { // 压缩级别
      level: 9
    }
  }).then(content => {
    // 把zip包写到硬盘中，这个content现在是一段buffer
    fs.writeFileSync(`./contents/${fileName}/zipTxt.zip`, content);
    console.log('压缩完成')
  }).catch(e => {
    console.log(e)
  });
}

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
  deleteall(`./contents/${fileName}`)
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
