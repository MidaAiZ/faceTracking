/*
 * 应用路由，实现页面切换
 * 1.首页index，静态图片识别
 * 2.相机页camera，摄像头识别
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '吴明达的多媒体项目' });
});

router.get('/camera', function(req, res, next) {
  res.render('camera', { title: '吴明达的多媒体项目' });
});
module.exports = router;
