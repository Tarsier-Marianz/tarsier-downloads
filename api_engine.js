dy_engine.version = 1;
dy_engine.is_native = !1;
(function() {
	function E(a, b) {
		var c = s(a),
			d = s(b);
		return c == d
	}

	function s(a) {
		a = /^(https?|ftp|data):/i.test(a) ? a : "http://" + a;
		return "/" == a[a.length - 1] ? a : a + "/"
	}

	function u(a) {
		a._start_time = Date.now() / 1E3;
		dy_bkg.update_field(a, "state", DyEnums.TaskState.DOWNLOAD);
		h.add(a);
		dy_engine.pollProgress.tid || (dy_engine.pollProgress.tid = setInterval(dy_engine.pollProgress, 1E3), dy_engine.pollProgress())
	}

	function y(a, b) {
		h.remove(a);
		0 == h.length() && (clearInterval(dy_engine.pollProgress.tid), dy_engine.pollProgress.tid = void 0);
		delete a._tostop;
		a._start_time && (a.time_elapsed += Math.max(0, Date.now() / 1E3 - a._start_time));
		delete a._start_time;
		a.active_threads = 0;
		!1 != b ? chrome.downloads.search({
			id: a.cr_id
		}, function(b) {
			b && b.length && (a.finished_bytes = b[0].bytesReceived);
			a.state == DyEnums.TaskState.FINISH ? (a.size = a.finished_bytes, a.progress = 100) : a.progress = 0 < a.size ? a.finished_bytes / a.size * 100 : 0;
			dy_bkg.dirtyTaskMan.set(a.id);
			sendUIMessage({
				cmd: "u_fields",
				id: a.id,
				fields: ["progress", "size", "time_elapsed"]
			})
		}) : (dy_bkg.dirtyTaskMan.set(a.id), sendUIMessage({
			cmd: "u_fields",
			id: a.id,
			fields: ["time_elapsed"]
		}))
	}

	function z(a, b, c) {
		A(b, a.id);
		a.cr_id = b;
		p[b] = a;
		if (!1 != c)
			for (b = l.find(a.url); b;) a.eurl = b, b = l.find(b);
		dy_bkg.dirtyTaskMan.set(a.id)
	}

	function A(a, b) {
		var c = p[a];
		c && c.id != b && w(c, a)
	}

	function w(a, b) {
		a.cr_id = -2;
		dy_bkg.dirtyTaskMan.set(a.id);
		delete p[b]
	}

	function F(a) {
		l.map[s(a.url)] = a.redirectUrl
	}

	function x(a) {
		-1 != dy_bkg.ui_tabid || dy_bkg.popup_dlist_open ? chrome.runtime.sendMessage({
			cmd: "u_accept",
			crid: a
		}) : dy_tabman.open_ui({
			activate: !0
		}, function() {
			chrome.runtime.sendMessage({
				cmd: "u_accept",
				crid: a
			})
		})
	}

	function G(a) {
		var b = p[a];
		b && (w(b, a), h.remove(b), console.log("onerased"))
	}

	function H(a) {
		var b = p[a.id];
		if (b) {
			var c = !1;
			a.exists && !a.exists.current && (c = !0);
			var d = !1,
				e = [],
				g;
			for (g in a) {
				var f = a[g].current,
					k;
				switch (g) {
					case "url":
						b.eurl = f;
						k = "eurl";
						break;
					case "filename":
						var f = B(b, f),
							m = a.danger ? a.danger.current : "";
						m && !f && "safe" != m && "accepted" != m && x(a.id);
						break;
					case "mime":
						b.mime_type = f;
						break;
					case "exists":
						b.exists = f;
						break;
					case "endTime":
						b.time_finish = new Date(f);
						k = "time_finish";
						break;
					case "state":
						if (!c) {
							if ("interrupted" == f) f = DyEnums.TaskState.INTERRUPTED;
							else if ("complete" == f) f = DyEnums.TaskState.FINISH;
							else break;
							q(b, f)
						}
						break;
					case "error":
						b.error_str = f;
						break;
					case "paused":
						if (c || a.state) break;
						!0 == f ? f = DyEnums.TaskState.PAUSE : (f = DyEnums.TaskState.DOWNLOAD, b.state != DyEnums.TaskState.DOWNLOAD && u(b));
						q(b, f);
						break;
					case "totalBytes":
					case "fileSize":
						b.size = f;
						k = "size";
						break;
					case "danger":
						a.filename || "safe" == f || "accepted" == f || x(a.id)
				}
				d || ("_all_" == k ? d = !0 : k && e.push(k))
			}
			dy_bkg.dirtyTaskMan.set(b.id);
			d ? sendUIMessage({
				cmd: "u_tasks",
				ids: [b.id]
			}) : 0 < e.length && sendUIMessage({
				cmd: "u_fields",
				id: b.id,
				fields: e
			})
		}
	}

	function C() {
		var a = dy_settings.get("fnconflict");
		if (0 > a || 5 <= a) a = 0;
		return I[a]
	}

	function J(a, b) {
		var c = dy_urlmonitor.getTask(a.id) || p[a.id];
		if (c) {
			var d = a.filename;
			c.file_ext = d;
			var e = dy_rules.def_matched();
			c.naming || (e = dy_rules.match(c));
			c.naming || (c.naming = e.naming);
			c.folder || (c.folder = e.folder);
			var e = DYTask.render_name(c),
				g = "";
			DYTask.is_good_name(e) ? g = e : (c.naming = d, console.log("naming mask not good, changing to provided:" + d));
			dy_bkg.dirtyTaskMan.set(c.id);
			c._name_cache = c._relname_cache = void 0;
			sendUIMessage({
				cmd: "u_fields",
				id: c.id,
				fields: ["naming"]
			});
			(c = g) ? b({
				filename: c,
				conflictAction: C()
			}): b()
		} else console.log("Task not found, wtf!! a canceled topause tasks?")
	}

	function K(a) {
		function b(a) {
			dy_engine.erase(a, !0);
			DYTask.reset(a, DyEnums.TaskState.DOWNLOAD);
			dy_bkg.dirtyTaskMan.set(a.id);
			D(a);
			sendUIMessage({
				cmd: "u_tasks",
				ids: [a.id]
			})
		}

		function c(a) {
			if (0 >= a.size) b(a);
			else {
				var c = chrome.i18n.getMessage("confirmCantResumeRestart", [DYTask.render_UI_name(a)]);
				chrome.runtime.sendMessage({
					cmd: "u_confirm",
					data: c
				}, function(g) {
					void 0 == g && (g = confirm(c));
					g ? b(a) : q(a, DyEnums.TaskState.INTERRUPTED)
				})
			}
		}
		u(a);
		void 0 == a.cr_id || 0 > a.cr_id ? c(a) : chrome.downloads.search({
			id: a.cr_id
		}, function(b) {
			b && b.length && (b[0].canResume || "in_progress" == b[0].state && !b[0].paused) ? chrome.downloads.resume(a.cr_id, function() {}) : c(a)
		})
	}

	function D(a) {
		if (0 <= a.cr_id) console.log("dy_engine.newDownload: call restart/resume instead");
		else {
			delete a._tostop;
			u(a);
			for (var b = 0; b < n.length; ++b)
				if (n[b].id == a.id && n[b].url == a.url) {
					console.log("duplicate issue!!");
					return
				}
			chrome.downloads.download({
				url: a.url,
				method: "GET",
				saveAs: !1,
				conflictAction: C()
			}, function(b) {
				if (void 0 == b) {
					for (b = 0; b < n.length; ++b)
						if (n[b].id == a.id) {
							n.splice(b, 1);
							break
						}
					a.cr_id = -2;
					chrome.runtime.lastError && chrome.runtime.lastError.message && (a.error_str = chrome.runtime.lastError.message);
					h.has(a.id) && q(a, DyEnums.TaskState.INTERRUPTED);
					console.log("fail to start download, " + JSON.stringify(chrome.runtime.lastError))
				}
			});
			n.push(a);
			return !0
		}
	}

	function L(a, b) {
		void 0 == a || 0 > a ? b && b() : chrome.downloads.search({
			id: a
		}, function(c) {
			c && c.length && "complete" == c[0].state && c[0].exists && chrome.downloads.removeFile(a, function() {});
			b && b()
		})
	}

	function B(a, b) {
		var c = !1;
		if (!a || void 0 == a.cr_id || 0 > a.cr_id) return c;
		a.full_path = b;
		var d = DYTask.render_name(a),
			e = b.replace(/^.*(\\|\/|\:)/, "");
		if (e && d != e) {
			var g = dy_settings.get("fnconflict");
			if (g == DyEnums.FnConflictAction.SKIP_CANCEL || g == DyEnums.FnConflictAction.SKIP_PAUSE) {
				var f = xtractFile(d).fname || "",
					k = xtractFile(e).fname || "";
				k.length > f.length && 0 == k.indexOf(f) && (g == DyEnums.FnConflictAction.SKIP_CANCEL ? (dy_bkg.remove_task_completely(a, !0, "bg"), console.log("file name conflicts: " + d + ", removing the task")) : g == DyEnums.FnConflictAction.SKIP_PAUSE && (dy_engine.erase(a, !0, !0), DYTask.reset(a), a.error_str = "fnConflict", q(a, DyEnums.TaskState.PAUSE), console.log("file name conflicts: " + d + ", pausing the task")), c = !0)
			}
			c || (a.name_conflict = e, a._name_cache = a._relname_cache = void 0, sendUIMessage({
				cmd: "u_fields",
				id: a.id,
				fields: ["naming"]
			}), dy_notify.update_name(a, e))
		}
		c || (chrome.downloads.getFileIcon(a.cr_id, {
			size: 16
		}, function(b) {
			dy_bkg.update_field(a, "iconURL16", b)
		}), chrome.downloads.getFileIcon(a.cr_id, {
			size: 32
		}, function(b) {
			dy_bkg.update_field(a, "iconURL32", b);
			dy_notify.update_icon(a, b)
		}));
		dy_bkg.dirtyTaskMan.set(a.id);
		return c
	}

	function q(a, b) {
		if (a) {
			var c = a.state;
			a.state = b;
			b != DyEnums.TaskState.DOWNLOAD && (y(a), dy_taskstarter.reschedule(), b == DyEnums.TaskState.FINISH ? c != b && (dy_settings.get("notify_finish") && (dy_notify.task_finish(a), dy_notify.show_tip("tip_notifications", 6)), dy_settings.get("sound_finish") && (c = new Audio("../snds/finish.ogg"), c.play())) : b == DyEnums.TaskState.INTERRUPTED ? c != b && (dy_settings.get("notify_error") && (dy_notify.task_error(a), dy_notify.show_tip("tip_notifications", 6)), dy_settings.get("sound_error") && (c = new Audio("../snds/error.ogg"), c.play())) : dy_settings.get("notify_progress") && dy_notify.remove_progress(a));
			dy_bkg.dirtyTaskMan.set(a.id);
			sendUIMessage({
				cmd: "u_fields",
				id: a.id,
				fields: ["state"]
			})
		}
	}
	var p = {};
	dy_engine.setup = function() {
		for (var a = 0; a < dy_bkg.bg_tasks.length; ++a) {
			var b = dy_bkg.bg_tasks[a].cr_id;
			0 <= b && (p[b] = dy_bkg.bg_tasks[a])
		}
		chrome.downloads.onChanged.addListener(H);
		chrome.downloads.onErased.addListener(G);
		chrome.downloads.onDeterminingFilename.addListener(J);
		chrome.webRequest.onBeforeRedirect.addListener(F, {
			urls: ["http://*/*", "https://*/*"]
		});
		return !0
	};
	var h = {},
		v = {},
		r = {};
	h.getByHost = function(a) {
		return r[a]
	};
	h.add = function(a) {
		if (a && a.url) {
			v[a.id] = !0;
			var b = host_from_url(a.url);
			void 0 == r[b] && (r[b] = {});
			r[b][a.id] = !0;
			dy_bkg.showBadge(-1)
		}
	};
	h.remove = function(a) {
		if (a) {
			delete v[a.id];
			var b = host_from_url(a.url),
				c = r[b];
			c && (delete c[a.id], 0 == Object.keys(c).length && delete r[b]);
			dy_bkg.showBadge(-1)
		}
	};
	h.has = function(a) {
		return !0 == v[a]
	};
	h.length = function() {
		return Object.keys(v).length
	};
	var l = {
		map: {}
	};
	l.clearTimer = setInterval(function() {
		l.map = {}
	}, 3E5);
	l.find = function(a) {
		if (0 != a.indexOf("data:")) {
			a = s(a);
			var b = l.map[a];
			return b ? (delete l.map[a], b) : null
		}
	};
	dy_engine.numDownloading = function() {
		return h.length()
	};
	dy_engine.handleSelfIssued = function(a) {
		A(a.id);
		for (var b = null, c = a.url, d = 0; d < n.length; ++d)
			if (E(n[d].url, c)) {
				b = n[d];
				n.splice(d, 1);
				break
			}
		if (!b) return !1;
		if (b._tostop) return delete b._tostop, chrome.downloads.cancel(a.id, function() {
			chrome.downloads.erase({
				id: a.id
			}, function(a) {
				q(b, DyEnums.TaskState.PAUSE)
			})
		}), console.log("ignore a _topause/erased task, cr_id:" + a.id), !0;
		z(b, a.id);
		a.referrer && (b.referer = a.referrer);
		b.mime_type = a.mime;
		b.exists = a.exists;
		dy_bkg.update_field(b, "size", a.totalBytes);
		return !0
	};
	dy_engine.addChromeTask = function(a, b, c, d) {
		z(a, b, !d);
		d || dy_bkg.add_display_task(a, !1);
		a.state == DyEnums.TaskState.DOWNLOAD && u(a);
		var e = !1;
		d ? (a.full_path = c, dy_bkg.dirtyTaskMan.set(a.id)) : e = c ? B(a, c) : !1;
		a._danger && (e || setTimeout(function() {
			x(b)
		}, 0), delete a._danger)
	};
	var I = ["uniquify", "overwrite", "prompt", "uniquify", "uniquify"];
	dy_engine.download = function(a) {
		if (!a) return !1;
		void 0 == a.cr_id || 0 > a.cr_id ? D(a) : K(a);
		return !0
	};
	dy_engine.pause = function(a) {
		void 0 == a.cr_id || 0 > a.cr_id ? a._tostop = !0 : chrome.downloads.pause(a.cr_id, function() {})
	};
	var n = [];
	dy_engine.erase = function(a, b, c, d) {
		y(a, !1);
		a._tostop = !0;
		var e = a.cr_id;
		void 0 == e || 0 > e || (w(a, e), !1 != d && (b ? a.state == DyEnums.TaskState.FINISH ? !0 != c ? L(e, function() {
			chrome.downloads.erase({
				id: e
			}, function(a) {})
		}) : chrome.downloads.erase({
			id: e
		}, function(a) {}) : chrome.downloads.cancel(e, function() {
			chrome.downloads.erase({
				id: e
			}, function(a) {})
		}) : chrome.downloads.erase({
			id: e
		}, function(a) {})))
	};
	dy_engine.idle_sync = function() {
		var a = dy_settings.get("dy_max_con_tasks");
		return h.length() < a
	};
	dy_engine.idle = function(a, b) {
		var c = dy_settings.get("dy_max_con_tasks");
		if (h.length() >= c) b(DyEnums.IdleState.LIMIT_TASKS);
		else {
			var d = host_from_url(a.url);
			chrome.downloads.search({
				state: "in_progress",
				urlRegex: "^((https?|ftp)://)?" + d + ".*"
			}, function(c) {
				var g = dy_settings.get("dy_max_con_tasks");
				if (h.length() >= g) b(DyEnums.IdleState.LIMIT_TASKS);
				else {
					var g = dy_settings.get("dy_max_per_server"),
						f = !1,
						k = h.getByHost(d),
						m = k ? Object.keys(k) : [],
						k = {};
					if (m && m.length)
						for (var t = 0; t < m.length; ++t) k[m[t]] = !0;
					m = Object.keys(k).length;
					if (c && c.length)
						for (var n = -10, t = 0; t < c.length; ++t) {
							var l = p[c[t].id],
								l = l ? l.id : n--;
							k[l] = !0
						}
					if (Object.keys(k).length < g || m < g && !0 == k[a.id]) f = !0;
					b(f ? DyEnums.IdleState.IDLE : DyEnums.IdleState.LIMIT_SERVER)
				}
			})
		}
	};
	dy_engine.explore = function(a, b) {
		a && (0 <= a.cr_id ? (chrome.downloads.show(a.cr_id), chrome.runtime.lastError && console.log("show lastError: " + JSON.stringify(chrome.runtime.lastError)), chrome.downloads.search({
			id: a.cr_id
		}, function(c) {
			var d = !0,
				e = "";
			c && c.length ? a.exists || (d = !1, e = chrome.i18n.getMessage("errorFileNotExist")) : 0 < a.time_elapsed && (d = !1, e = chrome.i18n.getMessage("errorRemovedFromChrome"));
			b && b(d, e)
		})) : b && b(!1, chrome.i18n.getMessage("errorRemovedFromChrome")))
	};
	dy_engine.exec = function(a, b) {
		a && (0 <= a.cr_id ? (chrome.downloads.open(a.cr_id), chrome.runtime.lastError && console.log("open lastError: " + JSON.stringify(chrome.runtime.lastError)), chrome.downloads.search({
			id: a.cr_id
		}, function(c) {
			var d = !0,
				e = "";
			c && c.length ? a.exists || (d = !1, e = chrome.i18n.getMessage("errorFileNotExist")) : 0 < a.time_elapsed && (d = !1, e = chrome.i18n.getMessage("errorRemovedFromChrome"));
			b && b(d, e)
		})) : b && b(!1, chrome.i18n.getMessage("errorRemovedFromChrome")))
	};
	dy_engine.poll = function(a) {
		chrome.downloads.search({
			state: "in_progress",
			paused: !1
		}, function(b) {
			var c = 0,
				d = b.length,
				e = [];
			if (b.length) {
				for (var g = b.length, g = 10 < g ? 10 : 5 < g ? 5 : 3, f = dy_engine.pollProgress._cnt_ % g, k = 0; k < b.length; ++k) {
					var m = b[k],
						h = m.id,
						l = m.bytesReceived,
						n = m.totalBytes - l,
						q = 0.001 * (new Date(m.estimatedEndTime)).getTime(),
						r = q - cur_t,
						s = 0;
					0 < n && 0 < r && (s = n / r, c += s);
					h % g == f && (h = p[h]) && (h.speed = s, h.finished_bytes = l, h.time_remained = void 0 == m.estimatedEndTime ? 8553600 : q - cur_t, e.push(h))
				}
				a(c, d, e)
			} else a(c, d, [])
		})
	};
	dy_engine.config = function(a, b) {};
	dy_engine.getVersion = function(a) {
		a(1)
	};
	dy_engine.browse = function(a, b) {}
})();