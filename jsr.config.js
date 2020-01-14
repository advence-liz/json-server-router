module.exports = {
  // root: 'mock',
  /**
   * 处理所有非GET请求
   * 当query fial 有值的时候认为请求设置为失败状态
   */
  handler (req, res, next) {
    const { ip, originalUrl, body } = req
    const isFail = !!req.query.fail
    res.json({
      code: isFail ? 500 : 200,
      message: isFail ? 'failed' : 'succeed',
      cookie: req.get('cookie'),
      ip,
      url: originalUrl,
      body: body
    })
  },
  queryMap: [
    ['_page', 'page'],
    ['_limit', 'len']
  ]
}
