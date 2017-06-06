/* 
 * 上滑组件
 * @Author: FengZihao 
 * @Date: 2017-04-19 09:38:17 
 * @Last Modified by: zihao5@staff.sina.com.cn
 * @Last Modified time: 2017-06-06 17:01:55
 */

; (function (win, doc) {
    var RollingUp = function (config) {
        if (!(this instanceof RollingUp)) {
            return new RollingUp(config);
        }
        var scrollName = config.scrollName;         // 当前滚动节点选择器 
        this.num = config.num;                       // 显示的列表数量
        this.intervalTime = config.intervalTime      // 更换选中的时间 单位毫秒
        this.animationTime = config.animationTime    // 滑动动画时间 单位毫秒
        this.fn = config.transitionBeginFn           // 用户自定义 滚动开始时需执行的函数

        this.init(scrollName);
        this.stopAndBegin(true);
        this.timer = setInterval(this.begin.bind(this), this.intervalTime);
    }

    RollingUp.prototype.init = function (scrollName) {
        this.ele = document.querySelector(scrollName);   // 滚动列表
        var ele = this.ele;
        var child = ele.children;
        var childNum = child.length;                    // 原始节点数量
        if (childNum === 0) {
            console.log('RollingUp 初始化失败，请检查列表是否为空');
            return;
        }
        for (var i = 0; i < this.num; i++) { // 添加额外节点 实现效果上无缝滚动
            var j = i;                  // 防止显示的列表数量比列表总数高
            if (j > childNum - 1) {
                j = 0;
            }
            var tempNode = child[j].cloneNode(true);
            tempNode.className = tempNode.className + ' j_rolling_up_append';
            ele.appendChild(tempNode);
        }
        ele.style.transform = 'translate3d(0,0,0)';
        ele.style.MozTransform = 'translate3d(0,0,0)';
        ele.style.WebkitTransform = 'translate3d(0,0,0)';
        ele.style.OTransform = 'translate3d(0,0,0)';
        // 初始化时 transition的时间将影响addeventlistener对transitionEnd事件的监听 设置为0则初始化时监听不到transitionEnd事件 非0值则经过 对应时间 后会触发transitionEnd事件 如不需监听初始化时的事件 则可设置为0
        ele.style.transition = 'transform 10ms linear';
        ele.style.MozTransition = 'transform 10ms linear';
        ele.style.WebkitTransition = 'transform 10ms linear';
        ele.style.OTransition = 'transform 10ms linear';
        this.distance = child[0].offsetHeight;  // 每次向上滑动的距离
        this.distanceAll = 0;   // 向上滑动的总距离
        this.childNum = childNum;
        this.endLine = this.distance * childNum;
    }

    RollingUp.prototype.begin = function () {
        if (this.fn) {
            this.fn();
        }
        this.distanceAll = this.distance + this.distanceAll;
        this.ele.style.transform = 'translate3d(0,-' + this.distanceAll + 'px,0)';
        this.ele.style.WebkitTransform = 'translate3d(0,-' + this.distanceAll + 'px,0)';
        this.ele.style.MozTransform = 'translate3d(0,-' + this.distanceAll + 'px,0)';
        this.ele.style.transitionDuration = this.animationTime + 'ms';
        this.ele.style.WebkitTransitionDuration = this.animationTime + 'ms';
        this.ele.style.MozTransitionDuration = this.animationTime + 'ms';

        if (this.distanceAll === this.endLine) {
            // 滑回顶点
            var self = this;
            setTimeout(function () {
                self.ele.style.transitionDuration = '0ms';
                self.ele.style.WebkitTransitionDuration = '0ms';
                self.ele.style.MozTransitionDuration = '0ms';
                self.ele.style.transform = 'translate3d(0,-' + 0 + 'px,0)';
                self.ele.style.WebkitTransform = 'translate3d(0,-' + 0 + 'px,0)';
                self.ele.style.MozTransform = 'translate3d(0,-' + 0 + 'px,0)';
                self.distanceAll = 0;
                if (this.fn) {
                    this.fn();
                }
            }, this.animationTime + 100);
        }
    }

    RollingUp.prototype.getCurrentEle = function () {
        var currentNum = this.distanceAll / this.distance;
        return currentNum > this.childNum - 1 ? currentNum - this.childNum : currentNum;
    }

    // 判断浏览器状态 未被激活时停止定时器 防止切换回来时一次滑动过多距离
    // 此方法在第一次进入页面时 一定会是非激活状态 之后标签页间切换正常
    RollingUp.prototype.stopAndBegin = function (flag) {
        var hiddenProperty = 'hidden' in document ? 'hidden' :
            'webkitHidden' in document ? 'webkitHidden' :
                'mozHidden' in document ? 'mozHidden' :
                    null;
        var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
        var self = this;
        var onVisibilityChange = function () {
            if (!document[hiddenProperty]) {
                console.log('页面激活');
                self.timer = setInterval(self.begin.bind(self), self.intervalTime);
            } else {
                console.log('页面非激活');
                clearInterval(self.timer);
            }
        };
        if (flag) {
            // 开启
            document.addEventListener(visibilityChangeEvent, onVisibilityChange);
        } else {
            clearInterval(self.timer);
            document.removeEventListener(visibilityChangeEvent, onVisibilityChange);
        }
    }

	/**
 	* 屏幕尺寸变化 自动调整移动距离
    * 如果与定时器设定的自动改变位置同时执行 将不会触发transitionEnd事件 如有需要需手动触发
 	*/
    RollingUp.prototype.screenChange = function (e) {
        var oldDistance = this.distance;
        var oldDistanceAll = this.distanceAll;
        var oldEndLine = this.endLine;

        var endLineScale = oldEndLine / oldDistance;
        var distanceAllScale = oldDistanceAll / oldDistance;

        this.distance = this.ele.children[0].offsetHeight;
        this.distanceAll = this.distance * distanceAllScale;
        this.endLine = this.distance * endLineScale;

        this.ele.style.transform = 'translate3d(0,-' + this.distanceAll + 'px,0)';
        this.ele.style.WebkitTransform = 'translate3d(0,-' + this.distanceAll + 'px,0)';
        this.ele.style.MozTransform = 'translate3d(0,-' + this.distanceAll + 'px,0)';
        this.ele.style.transitionDuration = '0ms';
        this.ele.style.WebkitTransitionDuration = '0ms';
        this.ele.style.MozTransitionDuration = '0ms';
    }

    RollingUp.prototype.clean = function () {
        var appendNode = this.ele.querySelectorAll('.j_rolling_up_append');
        for (var i = 0; i < this.num; i++) {
            this.ele.removeChild(appendNode[i]);
        }
        this.stopAndBegin(false);
    }

    win.RollingUp = RollingUp;

})(window, document);