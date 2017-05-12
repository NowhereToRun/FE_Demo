/*
 * @Author: FengZihao 
 * @Date: 2017-04-11 15:19:24 
 * @Last Modified by: zihao5@staff.sina.com.cn
 * @Last Modified time: 2017-05-12 17:35:12
 * 
 * 弹幕组件，依赖zepto或jquery
 */

;
(function (win, doc) {
    var DanMu = function (danMuConfig) {
        if (!(this instanceof DanMu)) {
            return new DanMu(danMuConfig);
        }
        danMuConfig = danMuConfig || {};
        this.rows = parseInt(danMuConfig.rows, 10) || 5; //限制显示行数 默认5行
        this.showTime = parseInt(danMuConfig.showTime, 10) || 7000;  // 每条弹幕的显示时长 默认7000ms
        this.intervalTime = parseInt(danMuConfig.intervalTime, 10) || 4000; // 每批弹幕的间隔时间 默认4000ms
        this.lineSpace = parseFloat(danMuConfig.lineSpace) || 25; // 弹幕行间距  默认25 （px）
        this.randomMax = parseInt(danMuConfig.randomMax, 10) || 0; // 随机时延最大值,单位ms 默认0 
        this.libs = []; // 弹幕库
        var parent = danMuConfig.parent || 'body';  // 弹幕画布父节点，若未指定则默认为body
        var layerClass = danMuConfig.layerClass || 'barrageUl';  // 弹幕ul class名称 未指定默认为barrageUl
        this.canvas = new Canvas(parent, layerClass, this.rows); // 画布 弹幕父节点
    };

    DanMu.prototype.stopAndBegin = function () {
        var hiddenProperty = 'hidden' in document ? 'hidden' :
            'webkitHidden' in document ? 'webkitHidden' :
                'mozHidden' in document ? 'mozHidden' :
                    null;
        var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
        var self = this;
        var onVisibilityChange = function () {
            if (!document[hiddenProperty]) {
                console.log('页面激活');
                self.timePause = setInterval(self.draw.bind(self, self.isCircle), self.intervalTime);
            } else {
                console.log('页面非激活');
                clearInterval(self.timePause);
            }
        };
        document.addEventListener(visibilityChangeEvent, onVisibilityChange);
    };

    DanMu.prototype.show = function () {
        this.canvas.layer.appendTo(this.canvas.parent);
        return this;
    };

    DanMu.prototype.hide = function () {
        this.canvas.layer.remove();
        return this;
    };

    DanMu.prototype.start = function (data, isCircle) {
        if (typeof (data) === 'undefined' && this.libs.length === 0) {
            return;
        }
        var self = this;
        this.isCircle = isCircle;
        this.show().insert(data);
        this.canvas.layer.on('transitionend', 'li', function (e) {
            $(e.target).remove();
        });
        this.stopAndBegin();
        this.draw(isCircle);
        this.timePause = setInterval(this.draw.bind(self, isCircle), this.intervalTime);
        return this;
    };

    DanMu.prototype.stop = function () {
        this.libs = [];
        this.pause();
        return this;
    };

    DanMu.prototype.pause = function () {
        // 暂停弹幕，再次start可继续之前未播放的弹幕
        var self = this;
        clearInterval(this.timePause);
        setTimeout(function () {
            self.hide();
        }, this.intervalTime + this.randomMax)
        return this;
    };

    DanMu.prototype.insert = function (data) {
        if (!data) {
            return this;
        }
        if (typeof data === 'string') {
            data = [
                { content: data }
            ];
        }
        this.libs = this.libs.concat(data);
        return this;
    };

    DanMu.prototype.draw = function (isCircle) {
        var arr = [];
        var temp = this.canvas.width - 1;
        var height = this.canvas.width * 0.045;
        for (var x = 0; x < this.rows && this.libs.length > 0; x++) {
            arr.push('<li style="position: absolute;left:' + temp + 'px;top:' + x * this.lineSpace + 'px;height:' + height + 'px; line-height:' + height + 'px;display: inline-block;white-space: pre;">');
            if (this.libs[0].color) {
                arr.push('<span style="color: ' + this.libs[0].color + ';">' + this.libs[0].content + '</span>');
            } else {
                arr.push('<span>' + this.libs[0].content + '</span>');
            }
            arr.push('</li>');
            var t = this.libs.shift();
            //重复播放时数据填充
            if (isCircle) {
                this.libs.push(t);
            }
        }
        this.canvas.layer.append(arr.join(''));
        var liLength = this.canvas.layer.children().length;
        var j = 0;
        while (j < liLength) {
            var li = this.canvas.layer.find('li').eq(j);
            if (li.hasClass('j_show') || li.hasClass('j_li_null')) {
                j++;
                continue;
            }
            for (var k = 0; k < this.rows; k++) {
                var item = this.canvas.layer.find('li').eq(j);
                var liWidth = item.width();
                item.css({
                    'transform': 'translate3d(-' + (this.canvas.width + liWidth) + 'px,0,0)',
                    '-webkit-transform': 'translate3d(-' + (this.canvas.width + liWidth) + 'px,0,0)',
                    '-moz-transform': 'translate3d(-' + (this.canvas.width + liWidth) + 'px,0,0)',
                    'transition': 'transform ' + (this.showTime) + 'ms linear ' + Math.round(Math.random() * this.randomMax) + 'ms',
                    // 'transition': '-webkit-transform ' + (this.showTime) + 'ms linear ' + Math.round(Math.random() * this.randomMax) + 'ms',
                    '-webkit-transition': '-webkit-transform ' + (this.showTime) + 'ms linear ' + Math.round(Math.random() * this.randomMax) + 'ms',
                    '-moz-transition': 'transform ' + (this.showTime) + 'ms linear ' + Math.round(Math.random() * this.randomMax) + 'ms',
                    '-webkit-backface-visibility': 'hidden',
                    '-webkit-transform-style': 'preserve-3d'
                });
                item.addClass('j_show');
                if (++j >= liLength) {
                    break;
                }
            }
        }
        return this;
    };


    var Canvas = function (parent, layerClass, rows) {
        this.parent = $(parent);
        this.rows = rows;
        this.width = this.parent.width();
        this.height = this.parent.height();
        // if (this.height / this.rows < 12) {
        //     this.rows = this.height / 12;
        // }
        this.layer = $('<ul></ul>', {
            class: layerClass,
            css: { width: this.width, height: this.height, zIndex: 500, overflow: 'hidden' }
        });
        if (this.parent.css('position') === 'static') {
            this.parent.css('position', 'relative');
        }
        this.layer.css({ position: 'absolute', left: 0, top: 0 });
    };
    window.DanMu = DanMu;
})(window, document);