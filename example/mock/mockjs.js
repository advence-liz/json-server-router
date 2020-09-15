module.exports = {
  // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
  'list|10': [
    {
      // 属性 id 是一个自增数，起始值为 1，每次增 1
      'id|+1': 1,
      // 随机中文名
      name: '@cname',
      // 随机地址
      address: '@city(true)',
      web: '@url',
      guid: '@guid',
      // 生成 200x 200 的图片
      image: '@image(\'200x200\')',
      constellation: '@constellation',
      // 三选一
      'oneOf|1': ['one', 'two', 'three'],
      // 生成满足正则条件的字符串
      regexp1: /[a-z][A-Z][0-9]/,
      regexp2: /\w\W\s\S\d\D/,
      regexp3: /\d{5,10}/
    }
  ]
}
