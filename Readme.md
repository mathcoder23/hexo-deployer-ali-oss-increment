#  hexo-deployer-ali-oss-increment部署器使用说明

> 此项目是基于`hexo-deployer-ali-oss`更改，不想麻烦还要上传到npm仓库，因此采用本地依赖的方式加载
> 新增了个人认为比较重要的增量上传，这样不用每次都全量上传文件，基本原理是计算文件的md5，然后在上传文件同时上传md5信息
# 集成
## 1.下载仓库源码
> [https://github.com/mathcoder23/hexo-deployer-ali-oss-incremen](https://github.com/mathcoder23/hexo-deployer-ali-oss-incremen)
## 2.在package.json中添加依赖
```
"dependencies": {
    "hexo": "^5.0.0",
    "hexo-deployer-ali-oss-increment": "file:./plugs/deploy-oss",//手动添加这个，文件位置具体以你的目录来定
    "hexo-deployer-git": "^3.0.0",
    "hexo-generator-archive": "^1.0.0",
    "hexo-generator-category": "^1.0.0",
    "hexo-generator-index": "^2.0.0",
    "hexo-generator-searchdb": "^1.3.4",
    "hexo-generator-tag": "^1.0.0",
    "hexo-renderer-ejs": "^1.0.0",
    "hexo-renderer-marked": "^4.0.0",
    "hexo-renderer-pug": "^2.0.0",
    "hexo-renderer-stylus": "^2.0.1",
    "hexo-server": "^2.0.0",
    "hexo-theme-landscape": "^0.0.3",
    "hexo-wordcount": "^6.0.1",
    "request": "^2.88.2"
  }
  
```
在hexo项目配置文件`_config.yml`中添加如下配置：

```
deploy:
  type: ali-oss-increment
  region: <您的oss 区域代码>
  accessKeyId: <您的oss  accessKeyId>
  accessKeySecret: <您的oss accessKeySecret>
  bucket: <您的bucket name>
  
```

就这么简单 然后执行部署命令：

```
hexo d
```

即可将项目部署到oss中 ，默认情况下，将文件上传到bucket的根目录下，如果需要部署到其他目录，请在deploy下添加remotePath选项进行指定

```
	remotePath:<您要部署的目录>
```



