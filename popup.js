
function formatDateTime(date) {
	var now = new Date();
	var zpad_mins = ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
	if (date.getYear() != now.getYear()) {
		return '' + (1900 + date.getYear());
	} else if ((date.getMonth() != now.getMonth()) || (date.getDate() != now.getDate())) {
		return date.getDate() + ' ' + chrome.i18n.getMessage('month' + date.getMonth() + 'abbr');
	} else if (date.getHours() == 12) {
		return '12' + zpad_mins + 'pm';
	} else if (date.getHours() > 12) {
		return (date.getHours() - 12) + zpad_mins + 'pm';
	}
	return date.getHours() + zpad_mins + 'am';
}

function formatBytes(n) {
	if (n < 1024) {
		return n + ' bytes';
	}
	var prefixes = 'KMGTPEZY';
	var mul = 1024;
	for (var i = 0; i < prefixes.length; ++i) {
		if (n < (1024 * mul)) {
			return (parseInt(n / mul) + '.' + parseInt(10 * ((n / mul) % 1)) +" "+ prefixes[i] + 'B');
		}
		mul *= 1024;
	}
	return '!!!';
}

function formatError(e){
	if(e){
		return e.replace('_', ' ').toLowerCase();
	}
}

function getURL(r,f,u){
	if(!r){
		if(!f){
			if(u)return u;
		}else{return f;}
	}else{return r;}
}


function getError(s,e){
	if(s==='interrupted'){
		if(e){ return formatError(e);}else{return s;}
	}else{return s;}
}

function showDefaultFolder(){
	chrome.downloads.showDefaultFolder();
}
(function () {
	'use strict';
	var $ul = $('.download-history'),
	$loading = $('.ui-loading');
	$loading.show();
	chrome.downloads.search({'limit': 100, 'orderBy':['-startTime'] }, function(data){
		console.log(data);
		$.each(data, function( index, value ) {
			var $item = this;
			if(value.filename){
				var $fileSize = formatBytes(value.fileSize);
				var $filename = value.filename.split('\\').pop();
				var $referrer = getURL(value.referrer, value.finalUrl, value.url);
				var $state	  = getError(value.state, value.error);
				$ul.append('<div class="tile" id="item_'+value.id+'">'+
								'<div class="tile-side pull-left">'+
									'<div class="ui-download-icon ui-download-icon-complete ">'+
										'<img class="icon" id="file-icon" alt src="icon32.png"><i class="'+value.state+' b-white right"></i>'+
									'</div>'+
								'</div>'+
								'<div class="tile-action">'+
									'<ul class="nav nav-list margin-no pull-right">'+										
										'<li class=" padding-bottom-sm">'+
											'<span class="label label-brand">'+$state+'</span>'+
										'</li>'+
										'<li>'+
											'<a class="text-black-sec waves-attach" href="'+value.url+'" target="_blank"><span class="icon">open_in_new</span></a>'+
										'</li>'+
										'<li class="dropdown">'+
											'<a class="dropdown-toggle text-black-sec waves-attach" data-toggle="dropdown"><span class="icon">settings</span></a>'+
											'<ul class="dropdown-menu dropdown-menu-right">'+
												'<li>'+
													'<a class="waves-attach" href="javascript:void(0)"><span class="icon icon-2x margin-right-sm">replay</span>Resume</a>'+
												'</li>'+
												'<li>'+
													'<a class="waves-attach" href="javascript:void(0)"><span class="icon icon-2x margin-right-sm">delete_forever</span>Remove</a>'+
												'</li>'+
												'<li>'+
													'<a class="waves-attach" href="javascript:void(0)"><span class="icon icon-2x margin-right-sm">screen_share</span>Show in folder</a>'+
												'</li>'+
											'</ul>'+
										'</li>'+
									'</ul>'+
								'</div>'+
								'<div class="tile-inner">'+
									'<span class="text-overflow">'+$filename +'<small class="text-black-hint pull-right">'+$fileSize+'</small></span>'+
									'<small class="text-overflow-referrer text-black-hint">'+$referrer+'</small>'+
								'</div>'+
							'</div>');
							
				chrome.downloads.getFileIcon(value.id, {'size': 32},function(icon_url) {					
					if (icon_url) {
						if($('#item_'+value.id+' img[id="file-icon"]').length){
							$('#item_'+value.id+' img[id="file-icon"]').attr("src",icon_url);
							value.icon_url = '';
						}
					}
				});	
			}
		});
		setTimeout(function() {
			$loading.hide();
		}, 100);
		
	});
	
})();
