const request = require('request')
const cheerio = require('cheerio')
const _ = require('underscore')
const fs = require('fs')

var articalList = [];
var offset = 10;
let url = 'https://mp.weixin.qq.com/s?__biz=MzA5NjUwOTYwOA==&amp;mid=2653217292&amp;idx=1&amp;sn=b2c670b3e9a0534ac36e4ec09e69b31a&amp;chksm=8b7f49cbbc08c0dd6ad720a569cc531ee378f401f05fc36d7acf997b9e9b0eb1f92cfea2140c&amp;scene=27#wechat_redirect'
function getArticalList(count=10) {
	console.log('list begin offset'+offset)
    request({
    	jar: true,
        headers: {
            Accept: '*/*',
           // 'Accept-Encoding': 'br, gzip, deflate',
           // 'Accept-Language': 'zh-cn',
            Host: 'mp.weixin.qq.com',
            Referer: 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5NjUwOTYwOA==&scene=124&devicetype=iOS11.1.2&version=16051720&lang=zh_CN&nettype=WIFI&a8scene=3&fontScale=100&pass_ticket=3XsmXUy2brv30FqdnQhrcmZOKYoMNFVnIG5tOyCUJPgEyDUh0GQpyyN8lW1flA7n&wx_header=1',
            Cookie: 'devicetype=iOS11.1.2; lang=zh_CN; pass_ticket=3XsmXUy2brv30FqdnQhrcmZOKYoMNFVnIG5tOyCUJPgEyDUh0GQpyyN8lW1flA7n; version=16051720; wap_sid2=COCLr50FElxJQkVkZEpxV0hHaEdIbWFnM3Fzbnlfb2wyRzRXRXc4bHJKNHpnLThIZURBcHBKZjh4bXhWQmU3SmZQanpYTzllbXRpb0NHYmdXeFBBT2VIdF9OaVRWS2NEQUFBfjDmy8fRBTgMQJRO; wxuin=1403766240; wxtokenkey=5a568bb237d89d2c2c20ec10ce32c302a195e9a6564ecb0bf7a08f50d9d6ec68; _scan_has_moon=1; pgv_pvid=353820746; sd_cookie_crttime=1511098555378; sd_userid=93351511098555378; tvfe_boss_uuid=1d67383d257f4e6a',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B202 MicroMessenger/6.5.23 NetType/WIFI Language/zh_CN'
        },
        url: `https://mp.weixin.qq.com/mp/profile_ext?action=getmsg&__biz=MzA5NjUwOTYwOA==&f=json&offset=${offset}&count=10&is_ok=1&scene=124&uin=777&key=777&pass_ticket=3XsmXUy2brv30FqdnQhrcmZOKYoMNFVnIG5tOyCUJPgEyDUh0GQpyyN8lW1flA7n&wxtoken=&appmsg_token=935_FjX0PLhqRnOC8JYe1li_b53FfYkYiy23UrcVOg~~&x5=0&f=json`
    }, function(error, response, body) {
    	if ( !error ) {
    		let list = JSON.parse(JSON.parse(body).general_msg_list).list
    		if ( list.length ) {
    			_.each(list, (v) => {
	    			let app_msg_ext_info = v.app_msg_ext_info

	    			if ( app_msg_ext_info && app_msg_ext_info.content_url && app_msg_ext_info.title && !/(开团|预告)/.test(app_msg_ext_info.title)) {
	    				articalList.push({
		    				title: app_msg_ext_info.title,
		    				digest: app_msg_ext_info.digest,
		    				content_url: app_msg_ext_info.content_url,
		    				cover: app_msg_ext_info.cover,
		    				subtype: app_msg_ext_info.subtype,
		    				type: v.type,
		    				datetime: v.datetime
		    			})
	    			}
	    		})
	    		console.log('list end offset'+offset)
	    		let time = Math.random()*(2000-500)+500
	    		setTimeout(() => {
	    			offset += 10
	    			console.log('done', time+'ms', articalList.length)
	    			getArticalList()
	    		}, time)
    		} else {
    			console.log(articalList.length + 'list done')
    			fs.writeFile('list.json', JSON.stringify(articalList), (err) => {
    				if (err) {
    					console.log(err)
    				} else {
    					console.log('list write done')
    				}
    			})
    			_.each(articalList, (v, index) => {
    				let time = Math.random()*(2000-500)+500
    				setTimeout(() => {
    					console.log(time+'ms', v.title)
    					getArtical(v)
    				}, time)
    				
    			})
    			
    		}
    	}
    })
}

function readList() {
	return new Promise((resolve, reject) => {
		fs.readFile('list.json', 'utf-8', function(err,data){ 
			if(err){ 
				reject(err)
			} else { 
				resolve(JSON.parse(data))
			}
		})
	})
}

class readAndWrite {
	
	constructor(list, fileName) {
		this.articals = [];
		this.list = list;
		this.fileName = fileName;
		this.begin = 0;
		this.writeArtical();
	}

	getArtical(item) {
		let self = this
		return new Promise( (resolve, reject) => {
		    request(item.content_url, function(error, response, body) {
		        if (!error && response.statusCode == 200) {
		            let $ = cheerio.load(body.toString(), {
		            	decodeEntities: false
		            })
		            let js_content = ''
		            let findFirstImg = false
		            let stop = false
		            let $pAndImg = $('#js_content p, #js_content img')
		            let imgAllLen = $('#js_content img').length
		            let imgCount = 0
		            $pAndImg.each((index, el) => {
		            	if ( stop ) { return }
		            	if ( $(el).is('p') ) {
		            		if ( /(萌芽的话|更多专题文章|拓展阅读)/.test($(el).text()) ) {
		            			stop = true
		            		} else {
		            			js_content += $(el).text()+'\n'
		            		}            		
		            	} else {
		            		imgCount++
		            		if ( imgCount >= imgAllLen ) { 
		            			stop = true 
		            			return
		            		}
		            		if ( findFirstImg ) {
		            			let thisSrc = $(el).data('src')
		            			if ( $(el).data('type') !== 'gif' ) {
		            				js_content += `<img src="${thisSrc}"/>`
		            			}
		            			
		            		} else {
		            			findFirstImg = true
		            		}		            		
		            	}
		            });
		            item.content = js_content.replace(/(\n)\1+/g, '\n')
		            self.articals.push(item)
		            console.log('request ok', $('#activity-name').text())
		            resolve()
		        } else {
		            reject(error)
		        }
		    })
		})
	}

	writeArtical() {
		let self = this;
		console.log(self.begin)
		this.getArtical(self.list[self.begin])
		.then(() => {
			self.begin ++;
			if ( self.begin <= self.list.length-1 ) {
				console.log('self.begin',self.begin)
				this.writeArtical(self.list[self.begin])
			} else {
	        	fs.writeFile(self.fileName, JSON.stringify(self.articals), (err) => {
				  	if (err) {
				  		console.log(err)
				  	} else {
				  		console.log(`write ${self.fileName}`);
				  	}				  
				})
			}
		})
	}
}




readList()
.then((list) => {
	let max = 100;
	let begin = 0;
	let end = begin + max;
	let thisRangeList = list.slice(begin, end);
	function crawlerArticals() {
		console.log('crawlerArticals', `data/${begin}_${end-1}` )		
		new readAndWrite(thisRangeList, `data/${begin}_${end-1}_content.json`)
		
		let time = Math.random()*(2000-500)+500
		setTimeout(() => {
			if ( end < list.length ) {
				begin = end
				end = begin + max
				thisRangeList = list.slice(begin, end)
				crawlerArticals()
			}
		}, time)
	}
	crawlerArticals()
}).catch((e) => {
	console.log(e)
})
