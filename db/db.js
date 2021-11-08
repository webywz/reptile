const env = process.env.NODE_ENV // 环境参数
// 配置
let MYSQL_CONF
if (env === 'dev') {
  // mysql
  MYSQL_CONF = {
    host: 'localhost',
    user: 'node',
    password: '123456',
    port: '3306',
    database: 'node',
  }
}

if (env === 'production') {
  // mysql
  MYSQL_CONF = {
    host: '114.116.126.63',
    user: 'reptile',
    password: 'reptile',
    port: '3306',
    database: 'reptile',
  }
}
module.exports = {
  MYSQL_CONF,
}
