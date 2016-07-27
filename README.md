# Groundhog
土拨鼠代理器。支持代理静态文件，请求mock数据，host绑定方式代理。


### Download

[mac](http://pan.baidu.com/s/1eSLS0Ie)
[win](http://pan.baidu.com/s/1o7JZY6u)


### Quickstart

***本代理器，代理端口为8888，前端页面端口为8887。换句话说就是，请保证这两个端口没有被其他程序占用。否则程序将无法启动***

#### 界面

1. 主界面
	![](http://ww1.sinaimg.cn/large/006tNbRwgw1f6737fpp5tj30zo0o3jzs.jpg)
	区域1展示所有经过代理器的请求。区域2展示每个请求的详细信息，包含请求头，请求体等。还有如果设置了代理规则，会在rule tab页显示那条代理规则生效了。
	
2. 配置界面
	![](http://ww2.sinaimg.cn/large/006tNbRwgw1f673flesrjj30y50nw412.jpg)
	区域1展示所有配置，区域2展示单个配置的详细信息和修改配置。
	
	

#### 实战配置

1. pc端本地开发静态文件代理    

 增加一个如下图的配置          
 
 ![](http://ww3.sinaimg.cn/large/006tNbRwgw1f673uiqalgj30lc0fhq3r.jpg)      
 这样规则的意思就是所有请求中带有`/test`路径的请求都会被转到本地的`/Users/flyover/test`目录下。     
 在`/Users/flyover`下创建一个test文件夹。    
 在test目录下创建一个index.html。    
 然后浏览器访问`127.0.0.1:8888/test/index.html`
 
2. pc端本地开发mock数据代理
> mock数据是在开发过程中，没有真实后端数据的时候。可以编写一些mock数据用于接口返回。

	修改之前的配置，增加mock文件路径
![](http://ww3.sinaimg.cn/large/006tNbRwgw1f6746086p4j30kv0fkt9f.jpg)
这样mock文件就会去指定的路径下寻找。    
在`/Users/flyover/`下创建一个mock文件夹。     
在mock目录中增加test_info.js文件，里面内容为


	```
module.exports = function(params) {
    if (params) {
        return {
            result: '200'
        }
    } else {
        return {
            result: '400'
        }
    }
}
	```

	类似得可以建更多简单的mock数据。 mock数据本身就是function。传入的params就是接口传给后端的参数。因此可以根据params返回不动的mock数据。      

	在浏览器中直接打开

	```
http://127.0.0.1:8888/xxxxx?api_name=test_info&info=xxxx
	```
其中api_name是需要增加这个参数的， 跟mock文件中的test_info.js对应。 api_name也可为apiName。   

 ***注意当有多个配置的时候，只有一个配置的mock路径会生效*** 建议关掉其他不用的配置       
 
 ![](http://ww4.sinaimg.cn/large/006tNbRwgw1f674u2pvv6j303z034a9y.jpg)
 
3. 移动端的开发调试       

	移动端设置网络代理到pc的ip地址和端口8888上。      
静态文件代理和mock数据代理和pc基本相似。     
***需要注意的是配置静态资源替换规则的时候需要全域名***    
![](http://ww1.sinaimg.cn/large/006tNbRwgw1f6751w4h7vj30fr03yaa5.jpg)


4. 本地静态文件采用线上数据      
   
	配置线上或者测试环境的ip       
![](http://ww3.sinaimg.cn/large/006tNbRwgw1f6754vv6lhj30lu05ldg4.jpg)      
***一旦配置了host,将忽略mock数据路径, 同样也只有一个配置的host会生效***

 
 










































 
 
	

