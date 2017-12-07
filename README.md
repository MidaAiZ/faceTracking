# 多媒体项目--人脸识别

## 系统环境搭建

系统环境：LINUX / WINDOWS
1. 首先要保证系统具有Node环境和npm包管理器，如果没有可如下安装：
    ```
    sudo apt install nodejs
    ```
    （需要安装版本大于号6的nodejs，如果此方法安装的版本号过低，请搜索`nvm`node管理器安装教程）
    完成后检查是否安装成功，运行
    ```
    nodejs -v
    ```
    安装成功后显示版本号,如`6.6.0`
2. 安装系统依赖包，运行
    ```
    sudo npm i
    ```
3. 启动应用，运行
    ```
    npm start
    ```
4. 打开浏览器，访问`localhost:3000`即可看到页面

## 项目说明
1. 测试环境:Ubuntu16.04 Chrome浏览器( 版本52.0.2743.116  64-bit) Node版本6.6.0
2. 在线部署地址: https://www.d.mxjyu.com
3. 算法训练内核：openCV，代码封装插件：tracking.js

## 代码结构说明
1. 算法实现`/src`
2. 视图显示`/views`
3. 静态图片资源`/public/assets`
4. 算法训练数据`/public/data`
5. 算法调用以及具体人脸识别的实现`tracking.js`
6. 视图样式文件`/public/stylesheets`
7. 系统路由`/ruotes`
8. 系统配置等其它文件`/`根目录下文件

## 其它信息
计算机三班 吴明达 1506010319
