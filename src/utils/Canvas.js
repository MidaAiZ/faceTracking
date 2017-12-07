/*
 * 绘图API封装
 */
(function() {

  tracking.Canvas = {};

  tracking.Canvas.loadImage = function(canvas, src, x, y, width, height, opt_callback) {
    var instance = this;
    var img = new window.Image();
    img.crossOrigin = '*';
    img.onload = function() {
      var context = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, x, y, width, height);
      if (opt_callback) {
        opt_callback.call(instance);
      }
      img = null;
    };
    img.src = src;
  };
}());
