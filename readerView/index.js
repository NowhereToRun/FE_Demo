(function () {
	"use strict";
	/**
 	* ReaderView组件数据模块
 	*/
	var ReaderViewData = (function () {
		var PageData = {},
			_beforeData = {},
			initEd = false,
			clsName = '__reader_view_article_wrap_' + Math.random().toString().substr(2) + '__',
			adoptableArticle = null;

		var initData = function () {
			var $article = $$(adoptableArticle.outerHTML);
			/*补全绝对路径链接*/
			$article.find('a').each(function (idx, a) {
				a.setAttribute('href', a.href);
				if (a.target == '' || a.target.toLowerCase() == '_self') {
					a.setAttribute('target', '_top');
				}
			});
			$article.find('img').each(function (idx, img) {
				img.setAttribute('src', img.src);
			});
			return $$.extend({
				article: $article[0].outerHTML,
				url: window.location.href,
				// leadingImage: ReaderArticleFinderJS.leadingImage && ReaderArticleFinderJS.leadingImage.src,
				// mainImage: ReaderArticleFinderJS.mainImageNode() && ReaderArticleFinderJS.mainImageNode().src,
				// pageNumber: ReaderArticleFinderJS.pageNumber,
				description: ReaderArticleFinderJS.pageDescription(),
				// nextPage: ReaderArticleFinderJS.nextPageURL(),
				title: ReaderArticleFinderJS.articleTitle()
				// rtl: !ReaderArticleFinderJS.articleIsLTR()
			}, PageData);
		}
		return {
			init: function () {
				if (initEd || !this.check()) {
					return this;
				}
				$$(ReaderArticleFinderJS.articleNode()).addClass(clsName);
				this.setData(initData());
				console.log(PageData);
				initEd = true;
				return this;
			},
			check: function () {
				if (adoptableArticle) {
					return true;
				}
				if (!ReaderArticleFinderJS.adoptableArticle()) {
					ReaderArticleFinderJS.isReaderModeAvailable();
				}
				return !!(adoptableArticle = ReaderArticleFinderJS.adoptableArticle());
			},
			setData: function (data, value) {
				if (typeof data == 'string' && typeof value != 'undefined') {
					PageData[data] = value;
				} else if (typeof data == 'object') {
					for (var key in data) {
						PageData[key] = data[key];
					}
				}
				return this;
			},
			/**
			 * 获取数据，keys不传则获取所有，传单个值返回单个项，传数组返回多项
			 */
			getData: function (keys) {
				if (!initEd) {
					this.init();
				}
				if (!keys) {
					return JSON.stringify(PageData) === '{}' ? null : PageData;
				}
				if (Array.isArray(keys)) {
					var _ret = {};
					keys.forEach(function (key) {
						if (PageData.hasOwnProperty(key)) {
							_ret[key] = PageData[key];
						}
					});
					return _ret;
				} else if (typeof keys == 'string') {
					return PageData[keys];
				}
			},
			// getMainContentCls: function () {
			// 	return initEd && clsName || null;
			// },
			// getStatus: function () {
			// 	return initEd;
			// }
		}
	})();

	/**
	 * ReaderView组件Panel模块
	 */
	var ReaderViewPanel = (function () {
		var initEd = false,
			showing = false,
			$html = $$('html'),
			domAdded = false,
			htmlOverflow = $html.css('overflow');

		var addWidget = function () {
			// 添加样式节点
			var style = $$("<style></style>", {
				type: "text/css"
			});
			style.text(
				'.readerViewSina>.j_original__sina{display:none;} ' +
				'.readerViewSinaPage *{max-width: 100%;} ' +
				'.readerViewSinaPage .art_tit_h1 {font-size: 24px;color: #1a1a1a;line-height: 34px;overflow: hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;word-break: break-all;margin: 30px 0 10px 0;-webkit-box-sizing: border-box;box-sizing: border-box;font-weight: bold;} ' +
				'.readerViewSinaPage p {margin: 0 0 5px 0;} '+
				'.readerViewSinaPage img {width:100%;margin: 0 0 5px 0;} '
			)
			$$('head').append(style);

			// 阅读模式容器
			var widgetDom = $$("<div></div>", {
				class: 'readerViewSinaPage',
				css: {
					'position': 'absolute',
					'width': '100%',
					'top': 0,
					'left': 0,
					'background': 'rgb(251, 251, 251)',
					'zIndex': '2147483647',
					'display': 'block',
					'border': 'none',
					'margin': 0,
					'box-sizing': 'border-box',
					'-webkit-box-sizing':'border-box',
					'padding': '0 15px 15px 15px',
					'font-size': '17px',
					'color': '#1a1a1a',
					'line-height': '27px',
					'word-break': 'normal',
					'text-align': 'justify'
				}
			})
			return widgetDom;
		}

		return {
			init: function () {
				if (initEd || !this.check()) {
					return this;
				}
				this.widgetDom = addWidget();
				initEd = true;
				return this;
			},

			/**
 			* 页面有覆盖的loading态时会影响到ReaderArticleFinderJS.isReaderModeAvailable()的检测 
			* 与Chrome阅读模式插件的使用场景不同，不能让有页面闪烁，所以这里忽略检测 
			*/
			check: function () {
				// return initEd || ReaderArticleFinderJS.isReaderModeAvailable();
				return initEd || true
			},
			show: function () {
				if (!initEd) {
					this.init();
				}
				if (!this.check()) {
					return this;
				}
				if (!domAdded) {
					$$('body').append(this.widgetDom);
					domAdded = true;
				}
				this.widgetDom.css('display', 'block');
				$$('body').addClass('readerViewSina');
				$$('body > *').not('script').not('.readerViewSinaPage').addClass('j_original__sina');
				showing = true;
				return this;
			},
			hide: function () {
				if (!initEd) {
					this.init();
				}
				if (!this.check()) {
					return this;
				}
				this.widgetDom.css('display', 'none');
				$html.css('overflow', htmlOverflow);
				$$('body > *').filter('.j_original__sina').removeClass('j_original__sina');
				showing = false;
				return this;
			},
			// getStatus: function () {
			// 	return initEd;
			// },
			// isShow: function () {
			// 	return showing;
			// }
		}
	})();

	/**
	  * ReaderView组件
	  */
	var ReaderView = {
		init: function () {
			ReaderViewData.init();
			ReaderViewPanel.init();
			return this;
		},
		check: function () {
			if (ReaderViewData.check() && ReaderViewPanel.check()) {
				return true;
			}
			return false;
		},
		show: function () {
			ReaderViewPanel.show();
			return this;
		},
		hide: function () {
			ReaderViewPanel.hide();
			return this;
		},
		setData: function () {
			ReaderViewPanel.widgetDom.append($$('<h1 class="art_tit_h1"></h1>', {
				text: ReaderViewData.getData('title')
			}));
			ReaderViewPanel.widgetDom.append(ReaderViewData.getData('article'));
			return this;
		}
	};

	/*初始化插件*/
	var readerViewInit = function () {
		if (ReaderView.check()) {
			ReaderView.init().setData().show();
			$$('.reader_view_sina_mask').hide();
		} else {
			$$('.reader_view_sina_mask').hide();
		}
	};

	readerViewInit();
})();
