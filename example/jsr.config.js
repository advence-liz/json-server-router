module.exports = {
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
  /**
   * 配置分页参数名默认_page,_limit即xxxxx/?_page=1&_limit=10
   * 配置完毕之后变为xxxxx/?page=1&len=10
   */
  queryMap: [
    ['_page', 'page'],
    ['_limit', 'len']
  ],
  /**
   * /api/posts # → /posts
   * /api/posts/1  # → /posts/1
   * /posts/1/show # → /posts/1
   * /posts/javascript # → /posts?category=javascript
   * /articles?id=1 # → /posts/1
   */
  routes: {
    '/api/*': '/$1',
    '/:resource/:id/show': '/:resource/:id',
    '/posts/:category': '/posts?category=:category',
    '/articles\\?id=:id': '/posts/:id'
  }
}
