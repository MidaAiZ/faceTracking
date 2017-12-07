(function() {
  /**
  * LBF(Local binary feature),基于局部二值特征的人脸特征点递，
  * 该算法的核心工作主要有两部分，总体上采用了随机森林和全局线性回归相结合的方法，
  * 相对于使用卷积神经的深度学习方法，LBF采用的算法是传统的机器学习方法。
  * LBF采用了一种局部二值特征，该特征是对12年的Face Alignment by Shape Regression(ESR)算法提到的形状索引特征的改进，
  * 从全局的索引特征升级为局部的二值索引特征，采用如下的公式表达：
  * St = St-1 + Rt(I, St-1)
  *
  */

  /**
   * 校准算法。
   * 每个阶段包含一个不同的随机森林和retrieves二元。
   * @type {number}
   * @static
   */
  tracking.LBF.maxNumStages = 4;

  /**
   * 保存回归量，负责提取局部特征
   * 利用训练数据对标记图像进行引导。
   * @type {object}
   * @protected
   * @static
   */
  tracking.LBF.regressor_ = null;

  /**
   * 一系列对图片以及图片中脸部标记的变量
   * @param {pixels} pixels 像素
   * @param {number} width 图片宽度.
   * @param {number} height 图片宽度.
   * @param {array} faces 图片中检测到的人脸数组
   * @return {array} The 对齐的图片坐标数组
   * @static
   */
  tracking.LBF.align = function(pixels, width, height, faces){

    if(tracking.LBF.regressor_ == null){
      tracking.LBF.regressor_ = new tracking.LBF.Regressor(
        tracking.LBF.maxNumStages
      );
    }
// NOTE: 皮肤颜色过滤器 和自适应阈值
    pixels = tracking.Image.grayscale(pixels, width, height, false);

    pixels = tracking.Image.equalizeHist(pixels, width, height);

    var shapes = new Array(faces.length);

    for(var i in faces){

      faces[i].height = faces[i].width;

      var boundingBox = {};
      boundingBox.startX = faces[i].x;
      boundingBox.startY = faces[i].y;
      boundingBox.width = faces[i].width;
      boundingBox.height = faces[i].height;

      shapes[i] = tracking.LBF.regressor_.predict(pixels, width, height, boundingBox);
    }

    return shapes;
  }

  /**
   * 从图片选择区域中获取标记
   * @param {matrix} shape 标记形状.
   * @param {matrix} boudingBox 区域.
   * @return {matrix} The
   * @static
   * @protected
   */
  tracking.LBF.unprojectShapeToBoundingBox_ = function(shape, boundingBox){
    var temp = new Array(shape.length);
    for(var i=0; i < shape.length; i++){
      temp[i] = [
        (shape[i][0] - boundingBox.startX) / boundingBox.width,
        (shape[i][1] - boundingBox.startY) / boundingBox.height
      ];
    }
    return temp;
  }

  /**
   * 将标记形状投射到包围区域中。
   * 地标形状有标准化标记，将这些标记映射到图片区域中
   * @param {matrix} shape 标记形状
   * @param {matrix} boudingBox 图片区域
   * @return {matrix} The 区域
   * @static
   * @protected
   */
  tracking.LBF.projectShapeToBoundingBox_ = function(shape, boundingBox){
    var temp = new Array(shape.length);
    for(var i=0; i < shape.length; i++){
      temp[i] = [
        shape[i][0] * boundingBox.width + boundingBox.startX,
        shape[i][1] * boundingBox.height + boundingBox.startY
      ];
    }
    return temp;
  }

  /**
   * 计算旋转和尺度从而变换形状
   * @param {matrix} shape1 将要变换的形状
   * @param {matrix} shape2 变换后的形状
   * @static
   * @protected
   */
  tracking.LBF.similarityTransform_ = function(shape1, shape2){

    var center1 = [0,0];
    var center2 = [0,0];
    for (var i = 0; i < shape1.length; i++) {
      center1[0] += shape1[i][0];
      center1[1] += shape1[i][1];
      center2[0] += shape2[i][0];
      center2[1] += shape2[i][1];
    }
    center1[0] /= shape1.length;
    center1[1] /= shape1.length;
    center2[0] /= shape2.length;
    center2[1] /= shape2.length;

    var temp1 = tracking.Matrix.clone(shape1);
    var temp2 = tracking.Matrix.clone(shape2);
    for(var i=0; i < shape1.length; i++){
      temp1[i][0] -= center1[0];
      temp1[i][1] -= center1[1];
      temp2[i][0] -= center2[0];
      temp2[i][1] -= center2[1];
    }

    var covariance1, covariance2;
    var mean1, mean2;

    var t = tracking.Matrix.calcCovarMatrix(temp1);
    covariance1 = t[0];
    mean1 = t[1];

    t = tracking.Matrix.calcCovarMatrix(temp2);
    covariance2 = t[0];
    mean2 = t[1];

    var s1 = Math.sqrt(tracking.Matrix.norm(covariance1));
    var s2 = Math.sqrt(tracking.Matrix.norm(covariance2));

    var scale = s1/s2;
    temp1 = tracking.Matrix.mulScalar(1.0/s1, temp1);
    temp2 = tracking.Matrix.mulScalar(1.0/s2, temp2);

    var num = 0, den = 0;
    for (var i = 0; i < shape1.length; i++) {
      num = num + temp1[i][1] * temp2[i][0] - temp1[i][0] * temp2[i][1];
      den = den + temp1[i][0] * temp2[i][0] + temp1[i][1] * temp2[i][1];
    }

    var norm = Math.sqrt(num*num + den*den);
    var sin_theta = num/norm;
    var cos_theta = den/norm;
    var rotation = [
      [cos_theta, -sin_theta],
      [sin_theta, cos_theta]
    ];

    return [rotation, scale];
  }

  /*
   * 在LBF算法中，使用了较为复杂的回归子预测形状，每一个预测单元使用随机树，并且使用随机森林来预测形状变化。
   * 其次，LBF算法并没有采用随机树叶子节点的形状作为预测输出，
   * 而是将随机森林的输出组成一种特征（这里也就是LBF），并用LBF来做预测，
   * 除了采用随机森林的结构做预测，LBF还针对每个关键点给出一个随机森林来做预测，
   * 并将所有关键点对应的随机森林输出的局部特征相互联系起来，称作为局部二值特征，
   * 然后利用这个局部二值特征做全局回归，来预测形状变化量。
   */


  /**
   * LBF随机森林的数据结构。
   * @static
   * @constructor
   */
  tracking.LBF.RandomForest = function(forestIndex){
    this.maxNumTrees = tracking.LBF.RegressorData[forestIndex].max_numtrees;
    this.landmarkNum = tracking.LBF.RegressorData[forestIndex].num_landmark;
    this.maxDepth = tracking.LBF.RegressorData[forestIndex].max_depth;
    this.stages = tracking.LBF.RegressorData[forestIndex].stages;

    this.rfs = new Array(this.landmarkNum);
    for(var i=0; i < this.landmarkNum; i++){
      this.rfs[i] = new Array(this.maxNumTrees);
      for(var j=0; j < this.maxNumTrees; j++){
        this.rfs[i][j] = new tracking.LBF.Tree(forestIndex, i, j);
      }
    }
  }

  /**
   * LBF树数据结构。
   * @static
   * @constructor
   */

  tracking.LBF.Tree = function(forestIndex, landmarkIndex, treeIndex){
    var data = tracking.LBF.RegressorData[forestIndex].landmarks[landmarkIndex][treeIndex];
    this.maxDepth = data.max_depth;
    this.maxNumNodes = data.max_numnodes;
    this.nodes = data.nodes;
    this.landmarkID = data.landmark_id;
    this.numLeafnodes = data.num_leafnodes;
    this.numNodes = data.num_nodes;
    this.maxNumFeats = data.max_numfeats;
    this.maxRadioRadius = data.max_radio_radius;
    this.leafnodes = data.id_leafnodes;
  }

}());
