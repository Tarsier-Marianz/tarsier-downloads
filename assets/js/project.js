	
	if (typeof jQuery.ui != 'undefined') {
		// draggable
			$('.ui-picker-draggable-handler').draggable({
				addClasses: false,
				appendTo: 'body',
				cursor: 'move',
				cursorAt: {
					top: 0,
					left: 0 
				},
				delay: 100,
				helper: function () {
					return $('<div class="tile tile-brand-accent ui-draggable-helper"><div class="tile-side pull-left"><div class="avatar avatar-sm"><strong>' + $('.ui-picker-selected:first .ui-picker-draggable-avatar strong').html() + '</strong></div></div><div class="tile-inner text-overflow">' + $('.ui-picker-selected:first .ui-picker-info-title').html() + '</div></div>');
				},
				start: function (event, ui) {
					var draggableCount = $('.ui-picker-selected').length;

					if (draggableCount > 1) {
						$('.ui-draggable-helper').append('<div class="avatar avatar-brand avatar-sm ui-picker-draggable-count">' + draggableCount + '</div>');
					};
				},
				zIndex: 100
			});

		// droppable
			$('.ui-picker-nav .nav a').droppable({
				accept: '.ui-picker-draggable-handler',
				addClasses: false,
				drop: function(event, ui) {
					$('body').snackbar({
						content: 'Dropped on "' + $(this).html() + '"'
					});
				},
				hoverClass: 'ui-droppable-helper',
				tolerance: 'pointer'
			});

		// selectable
		
			$pickerLib.selectable({
				cancel: '.ui-picker-draggable-handler',
				filter: '.ui-picker-selectable-handler',
				selecting: function (event, ui) {
					var $selectingParent = $(ui.selecting).parent();

					$selectingParent.addClass('tile-brand-accent ui-picker-selected');

					$('.ui-picker-info').addClass('ui-picker-info-active').removeClass('ui-picker-info-null');
					$('.ui-picker-info-desc-wrap').html($selectingParent.find('.ui-picker-info-desc').html());
					$('.ui-picker-info-title-wrap').html($selectingParent.find('.ui-picker-info-title').html());
					setURLScreenshot($selectingParent.find('#ui-url').attr('href'));
				},
				unselecting: function (event, ui) {
					var $unselectingParent = $(ui.unselecting).parent();
					$unselectingParent.removeClass('tile-brand-accent ui-picker-selected');

					if (!$('.ui-picker-selected').length) {
						$('.ui-picker-info').addClass('ui-picker-info-null');
						$('.ui-picker-info-desc-wrap').html('');
						$('.ui-picker-info-title-wrap').html('');
						//pickerMarker.setMap(null);
					} else {
						var $first = $($('.ui-picker-selected')[0]);
						$('.ui-picker-info-desc-wrap').html($first.find('.ui-picker-info-desc').html());
						$('.ui-picker-info-title-wrap').html($first.find('.ui-picker-info-title').html());
						
						setURLScreenshot($selectingParent.find('#ui-url').attr('href'));
					};
				}
			});
		
	};

	$(document).on('click', '.btn-url-state', function () {
		var $btn = $(this);
		var $id = $btn.attr('data-id');
		var $state = $btn.attr('state');
		blockURL({'id': $id, 'state': $state});
	});
	
	$(document).on('click', '.ui-picker-info-close', function () {
		$('.ui-picker-info').removeClass('ui-picker-info-active');
	});
	
	$('.nav > li > a').each(function() {
		if ($(this).attr('data-toggle')=='collapse') {		
			var $link_toggle= $(this);			
			if($link_toggle.attr('aria-expanded')==='true'){
				$link_toggle.prepend('<span class="icon icon-2x margin-right">keyboard_arrow_down</span>');
			}else{
				$link_toggle.prepend('<span class="icon icon-2x margin-right">keyboard_arrow_right</span>');
			}
		};			
	});
	$(document).on('click', '[data-toggle="collapse"]', function () {				
		var $link_toggle= $(this).find('span');			
		$link_toggle.next('.icon').toggle();
		$link_toggle.text($link_toggle.text() == 'keyboard_arrow_down' ? 'keyboard_arrow_right' : 'keyboard_arrow_down');
	});
	