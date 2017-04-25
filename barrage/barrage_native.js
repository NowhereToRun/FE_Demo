/*
 * @Author: FengZihao 
 * @Date: 2017-04-11 15:19:24 
 * @Last Modified by: zihao5@staff.sina.com.cn
 * @Last Modified time: 2017-04-14 17:38:09
 * 
 * 弹幕组件，无依赖文件
 */

; (function (win, doc) {
    var DanMu = function (danMuConfig) {
        if (!(this instanceof DanMu)) {
            return new DanMu(danMuConfig);
        }
        danMuConfig = danMuConfig || {};
        this.rows = parseInt(danMuConfig.rows, 10) || 5; //限制显示行数 默认5行
        this.showTime = parseInt(danMuConfig.showTime, 10) || 7000;  // 每条弹幕的显示时长 默认7000ms
        this.intervalTime = parseInt(danMuConfig.intervalTime, 10) || 4000; // 每批弹幕的间隔时间 默认4000ms
        this.lineSpace = parseInt(danMuConfig.lineSpace, 10) || 25; // 弹幕行间距  默认25 （px）
        this.randomMax = parseInt(danMuConfig.randomMax, 10) || 0; // 随机时延最大值,单位ms 默认0 
        this.libs = []; // 弹幕库
        var parent = danMuConfig.parent || 'body';  // 弹幕画布父节点，若未指定则默认为body
        var layerClass = danMuConfig.layerClass || 'barrageUl';  // 弹幕ul class名称 未指定默认为barrageUl
        this.canvas = new Canvas(parent, layerClass, this.rows); // 画布 弹幕父节点
    }

    DanMu.prototype.show = function () {
        this.canvas.parent.appendChild(this.canvas.layer);
        return this;
    }

    DanMu.prototype.hide = function () {
        this.canvas.parent.removeChild(this.canvas.layer);
        return this;
    };

    DanMu.prototype.start = function (data, isCircle) {
        if (typeof (data) === 'undefined' && this.libs.length === 0) { return; }
        var self = this;
        this.show().insert(data);
        this.canvas.layer.addEventListener('transitionend', function (e) {
            self.canvas.layer.removeChild(e.target);
        })
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
        clearInterval(this.timePause);
        this.hide();
        return this;
    };

    DanMu.prototype.insert = function (data) {
        if (!data) {
            return this;
        }
        if (typeof data === 'string') {
            data = [{ content: data }];
        }
        this.libs = this.libs.concat(data);
        return this;
    };

    DanMu.prototype.draw = function (isCircle) {
        var arr = [];        
        var temp = this.canvas.width-1;
        for (var x = 0; x < this.rows && this.libs.length > 0; x++) {
            // arr.push('<li style="position: absolute;left:' + this.canvas.width + 'px;top:' + x * this.lineSpace + 'px;display: inline-block;white-space: pre;">');
            arr.push('<li style="position: absolute;left:' + temp + 'px;top:' + x * this.lineSpace + 'px;display: inline-block;white-space: pre;">');
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
        };

        this.canvas.layer.appendChild(strToNode(arr.join('')));
        var liLength = this.canvas.layer.children.length;
        var j = 0;
        while (j < liLength) {
            if (this.canvas.layer.children[j].className.indexOf('j_show') !== -1) {
                j++
                continue;
            }
            for (var k = 0; k < this.rows; k++) {
                var item = this.canvas.layer.children[j];
                var liWidth = item.offsetWidth;
                item.style.transform = 'translateX(-' + (this.canvas.width + liWidth) + 'px)';
                item.style.WebkitTransform = 'translateX(-' + (this.canvas.width + liWidth) + 'px)';
                item.style.transition = 'transform ' + (this.showTime) + 'ms linear ' + Math.round(Math.random() * this.randomMax) + 'ms';
                item.style.WebkitTransition = 'translateX(-' + (this.canvas.width + liWidth) + 'px)';
                item.className += 'j_show';
                if (++j >= liLength) {
                    break;
                }
            }
        }
        return this;
    }

    var Canvas = function (parent, layerClass, rows) {
        this.parent = doc.querySelector(parent);
        this.rows = rows;
        this.width = this.parent.offsetWidth;
        this.height = this.parent.offsetHeight;
        // if (this.height / this.rows < 12) {
        //     this.rows = this.height / 12;
        // }
        if (getComputedStyle(this.parent).position === 'static') {
            this.parent.style.position = 'relative';
        }
        this.layer = document.createElement('ul');
        this.layer.setAttribute('class', layerClass);
        this.layer.style.width = this.width + 'px';
        this.layer.style.height = this.height + 'px';        
        this.layer.style.zIndex = 999;
        this.layer.style.position = 'absolute';
        this.layer.style.top = 0;
        this.layer.style.left = 0;
        this.layer.style.overflow = 'hidden';
    }

    var strToNode = function (str) {
        var docFrag = document.createDocumentFragment();
        var div = document.createElement('div');
        div.innerHTML = str;
        var childList = Array.prototype.slice.call(div.childNodes);
        var len = childList.length;
        for (var i = 0; i < len; i++) {
            docFrag.appendChild(childList[i]);
        }
        return docFrag;
    }

    window.DanMu = DanMu;
})(window, document);