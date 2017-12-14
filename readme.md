#爬取MY公众号历史消息

## step1 
`npm install` 安装依赖包

## step2
手机登录微信，获取历史消息，抓包抓到url等相关内容

## step3 
修改爬取文章列表接口，添加url refer cookie 以及user-Agent

`getArticalList()` 获取公众号文章列表

这个接口是会随着`session`过期改变`url refrer cookie` 的，且在500ms内连续发请求会被封

## step4
获取文章内容


