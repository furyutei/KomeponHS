// ==UserScript==
// @name           KomeponHS
// @namespace      http://d.hatena.ne.jp/furyu-tei
// @include        http://komepon.net/?u=*
// @description    append Hatena Star containers to Komepon! ver.0.01
// ==/UserScript==
/*
  Download: https://github.com/furyutei/KomeponHS/raw/master/KomeponHS.user.js
  GitHub: https://github.com/furyutei/KomeponHS
*/
/*
The MIT License (MIT)

Copyright (c) 2014 furyu <furyutei@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function(w, d){
var main = function(w, d){
	//{ user parameters
	var DEBUG = false;
	
	var	AUTOCLICK = true;
	var	AUTOCLICK_TIMING = 1.5;	//	ratio for window's height
	//} end of user parameters
	
	
	//{ global variables
	var NAME_SCRIPT = 'KomeponHS';
	var VER_SCRIPT = '0.01';
	var $ = w.$;
	
	//{ check environment
	if (w[NAME_SCRIPT+'_touched']) return;
	if (!$) {var main = arguments.callee; setTimeout(function(){main(w,d);}, 100); return}
	w[NAME_SCRIPT+'_touched'] = true;
	//} end of check environment
	
	//} end of global variables
	
	
	//{ functions
	var	log = w.log = (function(){
		var	con = w.console;
		if (!con || !con.log) return function(){};
		var	con_log = con.log;
		return function(str){
			con_log.call(con, str);
		};
	})();	//	end of log()
	
	var log_debug = (function(){
		if (!DEBUG) return function(){};
		return function(str){
			log(NAME_SCRIPT+' ['+new Date().toISOString()+'] '+str);
		};
	})();	//	end of log_debug()
	//} end of functions
	
	
	//{ main procedure
	$.getScript('http://s.hatena.ne.jp/js/HatenaStar.js', function(){
		var	EntryLoader = Hatena.Star.EntryLoader;
		
		var	load_stars = function(){
			log_debug('*** load_stars()');
			EntryLoader.loadEntries = function(){
				var	entries = [];
				
				$('div#pi-title h2:not(".'+NAME_SCRIPT+'_touched")').each(function(){
					var	jq_title = $(this);
					jq_title.addClass(NAME_SCRIPT+'_touched');
					if (0 < jq_title.find('hatena-star-add-button').size()) return;
					var	jq_link = jq_title.contents('a');
					if (jq_link.size() <= 0) return;
					var	container = jq_title.get(0);
					var	entry = {
						uri: jq_link.attr('href')
					,	title: Ten.DOM.scrapeText(jq_link.get(0))
					,	star_container: container
					,	comment_container: container
					};
					entries[entries.length] = entry;
					log_debug('[div#pi-title h2 a] '+entry.uri+' '+entry.title);
				});
				
				$('div#htn-comments,div#tw-comments').find('div.user-comment:not(".'+NAME_SCRIPT+'_touched")').each(function(){
					var	jq_comment = $(this), jq_container = jq_comment.children('p');
					jq_comment.addClass(NAME_SCRIPT+'_touched');
					if (0 < jq_container.find('hatena-star-add-button').size()) return;
					var	jq_link = jq_container.children('a');
					if (jq_link.size() <= 0) return;
					var	container = jq_container.get(0), jq_text = jq_comment.contents().filter(function(){return this.nodeType===3});
					var	entry = {
						uri: jq_link.attr('href')
					//,	title: jq_text.text()
					,	title: Ten.DOM.scrapeText(jq_comment.get(0))
					,	star_container: container
					,	comment_container: container
					};
					entries[entries.length] = entry;
					log_debug(entry.uri+' '+entry.title);
				});
				
				log_debug('  entries.length='+entries.length);
				
				return entries;
			};
			new EntryLoader();
		};	//	end of load_stars()
		
		var	tid_rsv = null;
		$(d).bind('DOMNodeInserted', function(e){
			//var	jq_target = $(e.target);
			//if ((jq_target.hasClass('user-comment')?jq_target:jq_target.find('div.user-comment')).size() <= 1) return;
			
			if (tid_rsv) {
				clearTimeout(tid_rsv);
			}
			tid_rsv = setTimeout(function(){
				load_stars();
			}, 300);
		});
		
		if (AUTOCLICK) {
			var	check_autoclick = function(){
				var	ypos = $(w).scrollTop() + ($(w).height() * AUTOCLICK_TIMING);
				$('div#htn-more,div#tw-more').each(function(){
					var	jq_more = $(this);
					if (jq_more.is(':hidden') || ypos < jq_more.offset().top || jq_more.text().match(/loading/i)) return;
					jq_more.click();
					log_debug('*** click div#'+jq_more.attr('id'));
				});
			};
			$(w).scroll(check_autoclick);
			$(w).resize(check_autoclick);
		}
		
		load_stars();
	});
	//} end of main procedure
	
}	//	end of main()

if (typeof w.$ == 'function') {
	main(w, d);
}
else {
	var container = d.documentElement;
	var script = d.createElement('script');
	script.textContent = '('+main.toString()+')(window, document);';
	container.appendChild(script);
}

})(window, document);

// ■ end of file