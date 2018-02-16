var dy_notify = {};
chrome.notifications.onClicked.addListener(function(a) {
	if (-1 != a.indexOf("task_") || -1 != a.indexOf("terr_") || -1 != a.indexOf("tfin_")) {
		var b = dy_settings.get("click_notify");
		b == DyEnums.ClickNotify.OPEN_MANAGER ? (dy_tabman.open_ui({
			activate: !0
		}, function() {
			var c = a.substring(5);
			chrome.runtime.sendMessage({
				cmd: "u_scroll",
				id: c
			})
		}), chrome.notifications.clear(a, function(a) {})) : b == DyEnums.ClickNotify.CLEAR_IT ? chrome.notifications.clear(a, function(a) {}) : dy_notify.clearAll()
	} else -1 != a.indexOf("tip_") && (dy_settings.inc(a), chrome.notifications.clear(a, function(a) {}))
});
chrome.notifications.onButtonClicked.addListener(function(a, b) {
	if ("reload_update" == a) {
		if (0 == b) {
			chrome.runtime.reload();
			return
		}
	} else if (-1 != a.indexOf("task_") || -1 != a.indexOf("terr_")) dy_tabman.open_ui({
		activate: !0
	}, function() {
		var b = a.substring(5);
		chrome.runtime.sendMessage({
			cmd: "u_scroll",
			id: b
		})
	});
	else if (-1 != a.indexOf("tfin_")) {
		var c = a.substring(5),
			c = dy_bkg.task_by_id(c);
		0 == b ? dy_engine.exec(c) : 1 == b && dy_engine.explore(c)
	} else -1 != a.indexOf("tip_") && (dy_settings.inc(a), 1 == b && (c = dy_settings.items[a]) && (c.set_section ? dy_tabman.open_options({
		section: c.set_section
	}) : c.set_page && chrome.tabs.create({
		url: c.set_page
	})));
	chrome.notifications.clear(a, function(a) {})
});
dy_notify.show_crxupdate = function(a) {
	if (!localStorage["noup_" + a]) {
		var b = {
			type: "basic",
			title: chrome.i18n.getMessage("msgTitleUpdateAvail", [a]),
			priority: 2,
			message: chrome.i18n.getMessage("msgTextUpdateAvail"),
			iconUrl: "../icons/update.png",
			buttons: [{
				title: chrome.i18n.getMessage("btnUpdateReload"),
				iconUrl: "../icons/reload.png"
			}, {
				title: chrome.i18n.getMessage("btnLater"),
				iconUrl: "../icons/clock.png"
			}]
		};
		chrome.notifications.create("reload_update", b, function(a) {});
		localStorage["noup_" + a] = 1
	}
};
dy_notify.show_tip = function(a, b) {
	var c = dy_settings.items[a];
	if (c && !(c.value >= b || c.shown_session))
		if (b && c.value + 1 != b) dy_settings.inc(a);
		else {
			var d = {
				type: "basic",
				title: chrome.i18n.getMessage("titleTips"),
				priority: 1,
				message: c.message,
				iconUrl: DyStrings.Icons.Logo48,
				buttons: [{
					title: chrome.i18n.getMessage("btnGotIt"),
					iconUrl: "../icons/tick.png"
				}]
			};
			(c.set_section || c.set_page) && d.buttons.push({
				title: chrome.i18n.getMessage("btnTakeMeThere"),
				iconUrl: "../icons/gear.png"
			});
			chrome.notifications.create(a, d, function(a) {});
			c.shown_session = !0
		}
};
dy_notify.task_start = function(a, b) {
	if (a && a.state != DyEnums.TaskState.FINISH && a.state != DyEnums.TaskState.INTERRUPTED) {
		var c = {
			type: "basic",
			title: DYTask.render_UI_name(a),
			message: b ? chrome.i18n.getMessage("msgTaskAddPaused") : chrome.i18n.getMessage("msgTaskStart"),
			iconUrl: a.iconURL32 || DyStrings.Icons.Unknown32,
			buttons: [{
				title: chrome.i18n.getMessage("btnOpenManager"),
				iconUrl: "../icons/table.png"
			}]
		};
		chrome.notifications.create("task_" + a.id, c, function(a) {})
	}
};
dy_notify.task_progress = function(a) {
	function b(a) {
		if (0 >= a.size) return 0 < a.finished_bytes ? get_byte_string(a.finished_bytes) : chrome.i18n.getMessage("phraseUnknownSize");
		var b = get_byte_string(a.size);
		return a.state == DyEnums.TaskState.FINISH || a.state == DyEnums.TaskState.INTERRUPTED ? b : chrome.i18n.getMessage("statusDownloadedSize", [get_byte_string(a.finished_bytes), b])
	}
	if (a && a.state == DyEnums.TaskState.DOWNLOAD) {
		var c = b(a),
			d = get_byte_string_(a.speed, "/s"),
			e = get_readable_duration(a.time_remained),
			f = c + "\n" + d + " - " + chrome.i18n.getMessage("statusTimeLeft", [e]);
		chrome.notifications.update("task_" + a.id, {
			progress: Math.round(a.progress),
			message: f
		}, function(b) {
			chrome.runtime.lastError && console.log(chrome.runtime.lastError);
			b || a._pnotify_created || chrome.notifications.clear("task_" + a.id, function(b) {
				a.state == DyEnums.TaskState.DOWNLOAD && (chrome.notifications.create("task_" + a.id, {
					type: "progress",
					priority: 2,
					title: DYTask.render_UI_name(a),
					iconUrl: a.iconURL32 || DyStrings.Icons.Unknown32,
					buttons: [{
						title: chrome.i18n.getMessage("btnOpenManager"),
						iconUrl: "../icons/table.png"
					}],
					progress: Math.round(a.progress),
					message: f
				}, function() {}), a._pnotify_created = !0)
			})
		})
	}
};
dy_notify.task_finish = function(a) {
	if (a) {
		var b = RegExp("^(" + imgtag_formats + ")$", "i"),
			c = {
				type: "basic",
				title: DYTask.render_UI_name(a),
				iconUrl: a.iconURL32 || DyStrings.Icons.Unknown32,
				message: chrome.i18n.getMessage("msgTaskFinish"),
				buttons: [{
					title: chrome.i18n.getMessage("optOptionOpenFile"),
					iconUrl: "../icons/file.png"
				}, {
					title: chrome.i18n.getMessage("optOptionOpenFolder"),
					iconUrl: "../icons/folder_open.png"
				}]
			},
			d = "";
		if (dy_bkg.file_access && a.full_path) {
			var e = xtractFile(a.file_ext || file_from_url(a.url));
			e.fext && b.test(e.fext) && (d = "file:///" + a.full_path)
		}
		d && (dy_settings.get("notify_large_preview") ? (c.type = "image", c.imageUrl = d) : (c.iconUrl = d, a._noty_icon_prev = !0));
		chrome.notifications.create("tfin_" + a.id, c, function(b) {
			dy_notify.remove_progress(a)
		})
	}
};
dy_notify.task_error = function(a, b) {
	if (a) {
		var c = {
			type: "basic",
			title: DYTask.render_UI_name(a),
			iconUrl: a.iconURL32 || DyStrings.Icons.Unknown32,
			message: chrome.i18n.getMessage("msgTaskInterrupt"),
			buttons: [{
				title: chrome.i18n.getMessage("btnOpenManager"),
				iconUrl: "../icons/table.png"
			}]
		};
		a.error_str && (c.contextMessage = DyStrings.Error[a.error_str] || a.error_str);
		chrome.notifications.create("terr_" + a.id, c, function(b) {
			dy_notify.remove_progress(a)
		})
	}
};
dy_notify.update_name = function(a, b) {
	chrome.notifications.update("task_" + a.id, {
		title: b
	}, function() {});
	chrome.notifications.update("tfin_" + a.id, {
		title: b
	}, function() {});
	chrome.notifications.update("terr_" + a.id, {
		title: b
	}, function() {})
};
dy_notify.update_icon = function(a, b) {
	chrome.notifications.update("task_" + a.id, {
		iconUrl: b
	}, function() {});
	a._noty_icon_prev || chrome.notifications.update("tfin_" + a.id, {
		iconUrl: b
	}, function() {});
	chrome.notifications.update("terr_" + a.id, {
		iconUrl: b
	}, function() {})
};
dy_notify.remove = function(a) {
	(dy_settings.get("notify_oneclick") || dy_settings.get("notify_progress")) && chrome.notifications.clear("task_" + a, function(a) {});
	dy_settings.get("notify_finish") && chrome.notifications.clear("tfin_" + a, function(a) {});
	dy_settings.get("notify_error") && chrome.notifications.clear("terr_" + a, function(a) {})
};
dy_notify.removeTask = function(a) {
	(dy_settings.get("notify_oneclick") || dy_settings.get("notify_progress")) && chrome.notifications.clear("task_" + a.id, function(a) {});
	dy_settings.get("notify_finish") && chrome.notifications.clear("tfin_" + a.id, function(a) {});
	dy_settings.get("notify_error") && chrome.notifications.clear("terr_" + a.id, function(a) {})
};
dy_notify.remove_progress = function(a) {
	chrome.notifications.clear("task_" + a.id, function(a) {});
	delete a._pnotify_created
};
dy_notify.clear = function(a, b) {
	chrome.notifications.getAll(function(c) {
		for (var d in c) - 1 != d.indexOf(a) && (chrome.notifications.clear(d, function(a) {}), b && (c = d.substring(5), delete dy_bkg.task_by_id(c)._pnotify_created))
	})
};
dy_notify.clearAll = function() {
	chrome.notifications.getAll(function(a) {
		for (var b in a) chrome.notifications.clear(b, function(a) {})
	})
};