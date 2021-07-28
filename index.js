/* global hexo */
'use strict';

hexo.extend.deployer.register('ali-oss-increment', function (args) {
    //导入ali-oss sdk
    const OSS = require('ali-oss');
    const rd = require('rd');
    const fs = require('fs');
    const path = require('path');
    const chalk = require('chalk');
    const crypto = require('crypto');

    // 获取需要部署的文件

    // 获取配置信息
    const oss_config = {
        region: args.region,
        accessKeyId: args.accessKeyId,
        accessKeySecret: args.accessKeySecret,
        bucket: args.bucket,
    }

    if (!oss_config.accessKeySecret || !oss_config.accessKeyId || !oss_config.bucket || !oss_config.region) {
        let help = '';
        help += chalk.red('[Deployer error] 您应该在_config.yml 文件中进行部署配置的设置\n\n');
        help += chalk.rgb(42, 92, 170)('配置示例如下：\n');
        help += chalk.rgb(42, 92, 170)('  deploy:\n');
        help += chalk.rgb(42, 92, 170)('    type: ali-oss\n');
        help += chalk.rgb(42, 92, 170)('    region: <您的oss存储桶所在区域代码>\n');
        help += chalk.rgb(42, 92, 170)('    accessKeyId: <您的oss accessKeyId>\n');
        help += chalk.rgb(42, 92, 170)('    accessKeySecret: <您的oss accessKeySecret>\n');
        help += chalk.rgb(42, 92, 170)('    bucket: <您的oss存储桶名称>\n');
        help += '如需更多帮助，您可以查看文档：' + chalk.underline('http://github.com/wertycn/hexo-deployer-ali-oss.html');
        console.log(help);
        return;
    }

    // 创建oss client实例
    var client = new OSS(oss_config)

    // 静态文件目录
    var localDir = hexo.public_dir

    // 获取上传后在OSS中保存的位置，默认为根目录
    var remoteDir = args.remotePath || '/'
    // 根据操作系统统一转换路径
    remoteDir = path.join(remoteDir)

    if (remoteDir == path.join("/")) {
        remoteDir = ""
    }

    // 上传文件到oss

    // 判断public目录是否存在
    async function put(localPath, AgainNum = 0) {
        // 生成对象KEY
        var objectKey = path.join(remoteDir, localPath.split(localDir)[1])

        // windows下替换\为/
        objectKey = objectKey.split('\\').join('/');

        try {
            //判断文件是否存在
            let isExist = false
            let isUpload = false
            let info = {}
            try {
                info = await client.head(objectKey, {});
                // console.log('info', info)
                isExist = true
            } catch (error) {
                if (error.code === 'NoSuchKey') {
                    isExist = false
                }
                console.log('ee', error)
            }

            //计算文件指纹
            const buffer = fs.readFileSync(localPath);
            const hash = crypto.createHash('md5');
            hash.update(buffer, 'utf8');
            const md5 = hash.digest('hex');

            if (isExist) {
                //文件存在 如果指纹变动 需要上传
                if (info.meta && info.meta["content-md5"] === md5) {
                    console.log("[%s] 部署跳过，文件已存在:%s", chalk.green('Deployer info'), localPath)
                } else {
                    isUpload = true
                }
            } else {
                isUpload = true
            }
            if (isUpload) {
                let result = await client.put(objectKey, localPath, {
                    meta: {
                        "content-md5": md5
                    }
                });

                if (result['res']['status'] == 200) {
                    console.log("[%s] 部署成功:%s", chalk.green('Deployer info'), localPath)
                }
            }


        } catch (e) {
            AgainNum += 1
            if (AgainNum >= 3) {
                console.log("[%s] 部署异常[ 文件路径 : %s,对象键 : %s] \n", chalk.green('Deployer error'), localPath, objectKey)
                console.log(e);
            } else {
                put(localPath, AgainNum)
            }
        }
    }

    // 同步遍历公共目录下的所有文件

    rd.eachFileSync(localDir, function (f) {
        // 每找到一个文件都会调用一次此函数
        put(f)
    });
    console.log("oss部署器执行完毕！请稍后查看上传结果！")

});
