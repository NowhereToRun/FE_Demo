# 前端的一些小Demo

#### 弹幕组件barrage使用说明
```  
依赖zepto或jquery

初始化：
var danMuConfig = {
	rows: 5,    // 行数
	showTime: 5000, // 滑动时间
	intervalTime: 4000, //每批弹幕间隔
	lineSpace: 24,  // 行间距 单位px
	randomMax: 2000,    // 延迟显示时间最大值
	layerClass: 'barrageUl',    // 弹幕父节点class名称（自定义）
	parent: '.barrage-top'      // 弹幕容器选择器
}
var danMuLib = [
	{ 'content': '厉害了，神评论！', color:'red' },
	{ 'content': '火钳刘明' },
	{ 'content': '什么鬼' },
	{ 'content': '心疼二楼30秒' },
	{ 'content': '老哥很稳~' },
	{ 'content': '一本正经的胡说八道' },
	{ 'content': '6666666666' },
	{ 'content': '高能预警' },
	{ 'content': '滴，老年卡' },
	{ 'content': '2333333' },
	{ 'content': '老司机开车' }
]
var danMu = new DanMu(danMuConfig); // 初始化弹幕容器
danMu.start(danMuLib, true);    // 启动弹幕，true代表循环显示

每个弹幕是一个li 样式可自定义 可参考
.barrageUl li {
	font-size: 12px;
	padding: 0 15px;
	color: #fff;
	display: block;
	white-space: nowrap;
	text-overflow: ellipsis;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 11px;
	transform: translate3d(1px,0,0);
}
为了显示优化 防止IOS中弹幕跳出（看起来不是滑入） 每个li初始时即会露出1px 
故其中 transform:translate3d(1px,0,0) 必须添加让其隐藏
```

#### 上滑组件rollingUp使用说明
```
本组件只负责初始化节点&&执行动画   不负责向容器内添加元素  容器的高度和overflow需自行设置
初始化
var rollingUp = new RollingUp({
    scrollName: '.j_content_ul',        // 当前滚动节点选择器 
    num: 6,                             // 显示的节点数量
    intervalTime: 3000,                 // 滑动间隔
    animationTime: 1000,                // 滑动执行时间
    transitionBeginFn: function () {}   // 滚动动画执行之前触发方法
});

每次滑动结束时触发事件方法：
rollingUp.ele.addEventListener('transitionend', function(){});

提供了清理方法 清理掉额外添加的节点和定时器：
rollingUp.clean();

提供了适配屏幕方法 如果容器的高度会随着屏幕的变化而变化 
在脚本中监听到页面变化时调用 screenChange 方法，会自动调节上滑距离
rollingUp.screenChange();
如果有在滑动结束时触发的事件此处最好手动再触发一次，以防错过事件


```

