/**
 * Created by land on 10/8/16.
 */


const path = require('path');
const webpack = require('webpack');
const fs = require("fs");

class SwitchNativePathToWebPath {
    constructor(dirArr) {
        this.dirArr = dirArr || ["./node_modules/audaque-ssz"];//需要处理的目录 需要在node_modules目录下
        this.pathArr = [];
        this.alias = {};
    }
    getFileName(dirPath) {
        let files = fs.readdirSync(dirPath);
        files.forEach(v => {
            let stat = fs.statSync(dirPath + "/" + v);
            if (stat.isDirectory()) {
                //是目录 就遍历
                this.getFileName(dirPath + "/" + v);
            } else {
                //如果是文件
                this.pathArr.push(dirPath + "/" + v);
            }
        });
    }
    getPathArr() {
        this.dirArr.forEach(v => {
            this.getFileName(v);
        });
    }
    filterWebPath() {
        this.pathArr.forEach(v => {
            if (/\.web\.js$/.test(v)) {
                let filepath = v.substring(15);
                if (filepath !== undefined) {
                    let subIndex = filepath.lastIndexOf(".") - 4;
                    let substr = filepath.substring(0, subIndex);

                    //path非index正常结尾
                    this.alias[substr + "$"] = filepath;
                    //如果index结尾
                    if (/\/index$/.test(substr)) {
                        this.alias[substr.substring(0, substr.lastIndexOf("/")) + "$"] = filepath;
                    }
                }
            }
        });
    }
    getAlias() {
        this.getPathArr();
        this.filterWebPath();
        console.log(this.alias);
        return this.alias;
    }
}

/////////////////////////////////////////////////////
module.exports = function (env) {
    const platform= env?JSON.stringify(env.platform):"\"development\""; //"'development'" || "'production'"
    console.log("env platform:",env,platform,platform==="\"production\"");
    let plugins=[
        //打包环境
        new webpack.DefinePlugin({
            //"process.env.NODE_ENV": platform
            'process.env': {
                NODE_ENV: platform
            }
        }),
        //提取公共部分
        new webpack.optimize.CommonsChunkPlugin({
            names: "bundle",
            //minChunks: 3,//3个页面用到才会提取公共
            minChunks: Infinity,
            //chunks:[] //这些页面才会提取
        }),
        new webpack.HotModuleReplacementPlugin({
            // Options...
        })
    ];
    if(platform==="\"production\""){
        plugins.push(
            //压缩
            //https://github.com/mishoo/UglifyJS2#mangleproperties-options
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    drop_debugger: true,
                    drop_console: true
                },
                comments: false
            })
        );
    }

    return (
        {
            devServer: {
                contentBase: path.join(__dirname, "web"),
                compress: false,
                port: 8880,
                host: "0.0.0.0",
                disableHostCheck: true,
                hot: true
            },
            entry: {

                //公共部分
                "bundle": ["babel-polyfill","isomorphic-fetch", "react-dom", "react", "react-native"],

                //收益
                "income": ["./native/income/index.js"],
                "bindWechat": ["./native/bindWechat"],
                "paymentInfo": ["./native/PaymentInfo/PaymentInfo"],
                "scores": "./native/integrity/scores",
                "scoresList": "./native/integrity/scoresList",
                "realNameAuthentication": "./native/realNameAuthentication",
                "unbindWechat": "./native/bindWechat/unbindWechat",
                ///////////------------h5页面-------------

                //赚币乐园
                "my_credits": "./web/containers/my_credits",//抽奖转盘
                "goodDetail": "./web/containers/goodDetail",
                "luckyWheel": "./web/containers/luckyWheel",
                "sign": "./web/containers/sign",

                //"sign": "./native/sign",

                //其它
                //"login": "./web/containers/login",
                //"register": "./web/containers/register",
                "guide": "./web/containers/guide",

                //任务
                //"taskList": "./native/taskList",
                //"detail": "./native/taskForms/detail",
                //"taskInfo": "./native/taskForms/taskInfo",
                "taskStatus": "./native/taskStatus",
                "taskAction": "./native/taskAction",

                //测试

            },
            output: {
                path: path.resolve(__dirname, "./web/build/"),
                filename: "[name].js",
                publicPath: "build/",//webpack-dev-server静态资源路径
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        include: [
                            path.resolve(__dirname, "node_modules/audaque-ssz"),
                            path.resolve(__dirname, "node_modules/react-native-root-siblings"),
                            path.resolve(__dirname, "node_modules/react-native-root-toast"),
                            path.resolve(__dirname, "node_modules/react-native-root-modal"),
                            path.resolve(__dirname, "native"),
                            path.resolve(__dirname, "./web/"),
                            path.resolve(__dirname, "./UIModel/"),
                            path.resolve(__dirname, "./redux/"),
                            path.resolve(__dirname, "./lib/")
                        ],
                        //exclude: excludePath,
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: [
                                "es2015",
                                "stage-1",
                                "react",
                            ],
                            plugins: [
                                //"transform-decorators-legacy",
                                //"transform-class-properties",
                            ]
                        }
                    },
                    {
                        test: /\.css$/,
                        use: [
                            "style-loader",
                            "css-loader",
                            "autoprefixer-loader"
                        ]
                    },
                    {
                        test: /\.scss$/,
                        use: [
                            "style-loader",
                            "css-loader",
                            "autoprefixer-loader",
                            "sass-loader"
                        ]
                    },
                    {
                        test: /\.(gif|jpe?g|png|svg)$/,
                        use: [
                            {
                                loader: "url-loader",
                                options: {
                                    "hash": "sha512",
                                    "digest": "hex",
                                    "name": "../images/webpack/[name]-[hash].[ext]",
                                    "limit": 8192
                                }
                            },
                            {
                                loader: "image-webpack-loader",
                                options: {
                                    progressive: true,
                                    optimizationLevel: 7,
                                    interlaced: false,
                                    pngquant: {
                                        quality: "65-90"
                                    },
                                    speed: 4
                                }
                            }
                        ]
                    }
                ]
            },
            plugins: plugins,
            resolve: {
                alias: Object.assign(
                    {},
                    {"react-native": "react-native-web"},
                    new SwitchNativePathToWebPath(["./lib/audaque-ssz"]).getAlias()
                ),
                extensions: [".web.js", ".js"]

            }

        }
    );
};
