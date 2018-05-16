(function(){
  //画板对象
  var Painter = {
    //绑定的环境上下文
    ctx: null, 
    //宽度
    w: 0,
    //高度
    h: 0,
    //当前画笔颜色
    bColor: null,
    //当前画笔大小
    bWidth: null,
    //初始化方法
    init: function() {
      var width = $('#paint-box').width();

      var can = $("#paintArea")[0];
      this.ctx = can.getContext('2d');
      this.w = width;
      this.h = can.height;

      if (window.devicePixelRatio) {
				can.style.width = this.w + "px";
				can.style.height = this.h + "px";
				can.height = this.h * window.devicePixelRatio;
				can.width = this.w * window.devicePixelRatio;
				this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }            

      this.setBGColor();
      this.setBrushColor();
      this.setBrushWidth();
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.initCanvas();
      this.initBrush();
      this.initEraser();
      this.initSave();
      this.initHideImg(); 
    },
    //初始化画笔
    initBrush: function() {
      //绑定画笔大小
      var bWidth = [4, 10, 16, 24];
      var bcDiv = $("#brush-box");
      for (var i = 0, len = bWidth.length; i < len; i++) {
        var className="";
        if (i == 0) {
          className = "active"
        }
        var bw = $("<span class='"+(className)+"' data-bidx='"+(i)+"'></span>");
        bw.css({"background-color": this.bColor, "width": bWidth[i]+'px', "height": bWidth[i]+'px'});
        bw.on("click", function(){
          self.fire("onPaintUpdate", {"width": bWidth[this.getAttribute("data-bidx")]});
          bcDiv.find('span').removeClass('active');
          $(this).addClass('active');
        });
        bcDiv.append(bw);
      }
      //产生画笔颜色
      var bColor = ["#000", "#999", "#fff", "#ff0000", "#ff9900", "#ffff00", "#008000", "#00ccff", "#0099ff", "#ff33cc", "#cc66ff", "#ffcccc", "#6633ff", "#ccffcc"];
      var bDiv = $("#color-box"),
        self = this;
      for (var i = 0, len = bColor.length; i < len; i++) {
        var className="";
        if (i == 0) {
          className = "active"
        }
        var b = $("<span class='"+(className)+"'></span>").css("background-color", bColor[i]);
        b.on("click", function(){
          //触发更新画板状态事件
          var color = $(this).css("background-color");
          self.fire("onPaintUpdate", {"color": color})
          bDiv.find('span').removeClass('active');
          $(this).addClass('active');
          //更改画笔大小颜色
          bcDiv.find('span').css('background-color', color);
          //取消橡皮擦激活状态
          $('#eraser').removeClass('active');
        });
        bDiv.append(b);
      }

    },
    initEraser: function() {
      var self = this;
      //绑定屏幕清除事件
      $("#clear").click(function(){
        $('#mask').css('display', 'flex');
      });
      //擦除
      $("#eraser").click(function(){
        self.setBrushColor("#f8f9e0");
        self.setBrushWidth(self.bWidth);
        $("#brush-box").find('span').css('background-color', '#f8f9e0');
        $("#color-box").find('span').removeClass('active');
        $(this).addClass('active');
      })
      //模态框消失
      $('.hide-mask').on('click', function(){
        $("#mask").hide();
      })
      //绑定清除事件
      $('#delete').on('click', function(){
        self.clear();
        $("#mask").hide();
      })
    },
    //
    initHideImg: function() {
      $("#save-container").on('click', function(){
        $(this).hide();
        $(this).find('img').remove();
      })
    },
    //初始化保存事件 初始化隐藏和清除事件
    initSave: function(){
      var self = this;
      $('#save').on('click', function(){
        self.save();
      })
    },
    //设置背景颜色和大小
    setBGColor: function(color) {
      this.ctx.fillStyle = color || "#f8f9e0";
      this.ctx.fillRect(0, 0, this.w, this.h);
    },    
    //设置画笔颜色
    setBrushColor: function(color) {
      this.bColor= color || "black";
      this.ctx.strokeStyle = this.bColor;
    },
    //设置画笔宽度
    setBrushWidth: function(width) {
      this.bWidth = width || 1;
      this.ctx.lineWidth = this.bWidth;
    },
    //初始画板
    initCanvas: function() {
      var can = $("#paintArea"),
        self = this;
      can.on("touchstart", function(e){
        e.preventDefault();
        this.x = Math.ceil(e.targetTouches[0].pageX);
        this.y = Math.ceil(e.targetTouches[0].pageY);
        self.fire("onStartDraw", {"x": this.x, "y": this.y});
        //绑定鼠标移动事件
        can.on("touchmove", function(e){
          var nx = Math.ceil(e.targetTouches[0].pageX),
            ny = Math.ceil(e.targetTouches[0].pageY);
          self.fire("onDrawing", {"x": nx, "y": ny});
          this.x = nx;
          this.y = ny;
        });
        can.on("touchend", function(){
          can.off('touchmove');
        })
      })
    },
    //清除画板
    clear: function() {
      this.ctx.clearRect(0, 0, this.w, this.h);
    },
    //生成图片方法
    save: function() {
      var image = new Image();
      image.src = $("#paintArea")[0].toDataURL("image/jpg");
      $('#save-container').append(image).css('display', 'flex');
    },
    //触发画板事件
    fire: function(eventName, param) {
      if (this[eventName]) {
        this[eventName](param);
      }
    },
    //开始画画事件
    onStartDraw: function(data) {
      this.ctx.beginPath();
      this.ctx.moveTo(data.x, data.y);
    },
    //画画事件
    onDrawing: function(data) {
      this.ctx.lineTo(data.x, data.y);
      this.ctx.stroke();
    },
    //画板更新事件
    onPaintUpdate: function(data) {
      var w = data.width || this.bWidth,
        c = data.color || this.bColor;
      //设置画笔大小
      this.setBrushWidth(w);
      //设置画笔颜色
      this.setBrushColor(c);
    }

  }
  Painter.init();
  window.Painter = Painter;
}())