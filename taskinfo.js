var dy_taskinfo = {};
(function() {
	var h = null,
		k = '<img src="' + DyStrings.Icons.Copy + '"/>',
		m = RegExp("^(" + imgtag_formats + ")$", "i"),
		g = {
			iconURL32: {
				asrow: !1,
				type: "string",
				fmt: function(a) {
					var c = "";
					if (dy_bkg.file_access && a.state == DyEnums.TaskState.FINISH && a.full_path && a.exists) {
						var e = xtractFile(a.file_ext || file_from_url(a.url));
						e.fext && m.test(e.fext) && (c = "file:///" + a.full_path)
					}
					c || (c = a.iconURL32 || DyStrings.Icons.Unknown32);
					return '<img align="top" src="' + c + '"/>'
				}
			},
			filepath: {
				label_id: "iconURL32",
				label: "...",
				rowspan: 2,
				type: "button",
				fmt: function(a) {
					return DYTask.render_UI_relname(a)
				},
				onclick: function(a) {
					dy_engine.exec(a, function(a, e) {
						a || alert(e)
					})
				},
				btns: [{
					text: '<img src="' + DyStrings.Icons.OpenFolder + '"/>',
					title: chrome.i18n.getMessage("tipBtnOpenFolder"),
					onclick: function(a) {
						dy_engine.explore(a, function(a, e) {
							a || alert(e)
						})
					}
				}]
			},
			url: {
				label: "",
				type: "link",
				fmt: function(a) {
					return trimLen(a.url, 256, "...")
				},
				btns: [{
					text: k,
					title: chrome.i18n.getMessage("tipBtnCopyLink"),
					onclick: function(a) {
						dy_ui.update_status_queue(chrome.i18n.getMessage("statusCopyURL"));
						writeClipboard(a.url);
						dy_ui.update_status_queue(chrome.i18n.getMessage("statusCopyURLDone"), 1500);
						ui_notify.show_tip("tip_copyselurls", 1)
					}
				}]
			},
			eurl: {
				label: chrome.i18n.getMessage("fieldRedirection"),
				type: "link",
				fmt: function(a) {
					return a.eurl && a.url != a.eurl ? trimLen(a.eurl, 256, "...") : "*!<>?"
				},
				btns: [{
					text: k,
					title: chrome.i18n.getMessage("tipBtnCopyLink"),
					onclick: function(a) {
						dy_ui.update_status_queue(chrome.i18n.getMessage("statusCopyURL"));
						writeClipboard(a.eurl);
						dy_ui.update_status_queue(chrome.i18n.getMessage("statusCopyURLDone"), 1500)
					}
				}]
			},
			referer: {
				label: chrome.i18n.getMessage("fieldReferer"),
				fmt: function(a) {
					return trimLen(a.referer, 256, "...") || "*!<>?"
				},
				type: "link",
				btns: [{
					text: k,
					title: chrome.i18n.getMessage("tipBtnCopyLink"),
					onclick: function(a) {
						dy_ui.update_status_queue(chrome.i18n.getMessage("statusCopyURL"));
						writeClipboard(a.referer);
						dy_ui.update_status_queue(chrome.i18n.getMessage("statusCopyURLDone"), 1500)
					}
				}]
			},
			naming: {
				label: chrome.i18n.getMessage("fieldNaming"),
				type: "string",
				placeholder: chrome.i18n.getMessage("phraseAutomatic"),
				fmt: function(a) {
					return a.naming || "[" + chrome.i18n.getMessage("phraseAutomatic") + "]"
				},
				onchanged: function(a, c) {
					a._name_cache = a._relname_cache = void 0;
					dy_bkg.update_field(a, "naming", c, !1)
				}
			},
			folder: {
				label: chrome.i18n.getMessage("fieldFolder"),
				type: "combo",
				native_only: !0,
				placeholder: chrome.i18n.getMessage("phraseAutomatic"),
				fmt: function(a) {
					return a.folder
				},
				onchanged: function(a, c) {}
			},
			size: {
				label: chrome.i18n.getMessage("fieldFileSize"),
				type: "string",
				fmt: function(a) {
					return 0 <= a.size && 1E3 > a.size ? a.size + "B" : get_byte_string_(a.size, " (" + chrome.i18n.getMessage("unitBytes", [a.size]) + ")")
				}
			},
			finished_bytes: {
				label: chrome.i18n.getMessage("fieldDownloadedSize"),
				type: "string",
				fmt: function(a) {
					return a.state == DyEnums.TaskState.FINISH || a.state == DyEnums.TaskState.INTERRUPTED ? "*!<>?" : 0 <= a.finished_bytes && 1E3 > a.finished_bytes ? a.finished_bytes + "B" : get_byte_string_(a.finished_bytes, " (" + chrome.i18n.getMessage("unitBytes", [a.finished_bytes]) + ")")
				}
			},
			state: {
				label: chrome.i18n.getMessage("fieldState"),
				type: "string",
				fmt: function(a) {
					var c = DyStrings.TaskState[a.state];
					a.state == DyEnums.TaskState.INTERRUPTED && a.error_str && (c += " (" + (DyStrings.Error[a.error_str] || a.error_str) + ")");
					return c
				}
			},
			avgspeed: {
				label: chrome.i18n.getMessage("fieldAvgSpeed"),
				type: "string",
				fmt: function(a) {
					a = a.finished_bytes / a.time_elapsed;
					if (isNaN(a) || !isFinite(a)) a = -1;
					return get_byte_string_(a, "/s")
				}
			},
			time_add: {
				label: chrome.i18n.getMessage("fieldAddTime"),
				type: "string",
				fmt: function(a) {
					return a.time_add ? a.time_add.format("yyyy-MM-dd hh:mm:ss") : ""
				}
			},
			time_elapsed: {
				label: chrome.i18n.getMessage("fieldElapsedTime"),
				type: "string",
				fmt: function(a) {
					return get_duration_string(a.time_elapsed)
				}
			},
			time_finish: {
				label: chrome.i18n.getMessage("fieldFinishTime"),
				type: "string",
				fmt: function(a) {
					return a.time_finish ? a.time_finish.format("yyyy-MM-dd hh:mm:ss") : ""
				}
			},
			threads: {
				label: chrome.i18n.getMessage("fieldThreads"),
				type: "number",
				min: 1,
				max: 15,
				native_only: !0,
				fmt: function(a) {
					return a.max_threads_config
				},
				onchanged: function(a, c) {}
			},
			desc: {
				label: chrome.i18n.getMessage("fieldRemarks"),
				type: "textarea",
				fmt: function(a) {
					return a.desc
				},
				onchanged: function(a, c) {
					dy_bkg.update_field(a, "desc", c, !1)
				}
			}
		};
	dy_taskinfo.setup = function() {
		var a = "",
			c = dy_engine.is_native,
			e = 0,
			f;
		for (f in g) {
			var d = "dy_ti_" + f,
				b = g[f];
			if (!1 != b.asrow && (c || !b.native_only)) {
				if (0 < e--) a += '<tr id="' + d + '_tr"><td class="dy_ti_value">';
				else {
					var e = 0,
						k = b.rowspan || 1,
						l = b.label_id ? ' id="dy_ti_' + b.label_id + '" ' : "";
					1 < k ? (a += '<tr id="' + d + '_tr"><td class="dy_ti_label"' + l + ' rowspan="' + k + '">' + b.label + '</td><td class="dy_ti_value">', e = 1) : a += '<tr id="' + d + '_tr"><td class="dy_ti_label"' + l + ">" + b.label + '</td><td class="dy_ti_value">'
				}
				switch (b.type) {
					case "string":
						a += '<span id="' + d + '"></span>';
						break;
					case "link":
						a += '<a target="_blank" id="' + d + '"></a>';
						break;
					case "button":
						a += '<a href="#" class="dy_ti_btn" style="margin-left:0" index="-1" field="' + f + '" id="' + d + '"></a>';
						break;
					case "text":
						a += '<input type="text" id="' + d;
						a = b.placeholder ? a + ('" placeholder="' + b.placeholder + '"/>') : a + '"/>';
						break;
					case "number":
						a += '<input type="number" id="' + d + ' min="' + b.min + '" max="' + b.max + '" name="' + f + '" required="required">&nbsp&nbsp(' + b.min + "-" + b.max + ")";
						break;
					case "textarea":
						a += '<textarea rows=5 id="' + d + '"></textarea>'
				}
				if (b.btns)
					for (d = 0; d < b.btns.length; ++d) a += '<a class="dy_ti_btn undraggable" index="' + d + '" title="' + (b.btns[d].title || "") + '" field="' + f + '">' + b.btns[d].text + "</a>";
				a += "</td>"
			}
		}
		$("#dy_info_table").html(a);
		$(".dy_ti_btn").click(function() {
			var a = $(this).attr("index"),
				b = $(this).attr("field");
			if (-1 == a) g[b].onclick(h);
			else g[b].btns[a].onclick(h)
		});
		$("#dy_info_table input[type=number]").numeric({
			decimal: !1,
			negative: !1
		});
		$("#dy_info_table input, #dy_info_table textarea").change(function() {
			var a = this.id.substring(6);
			(a = g[a].onchanged) && a(h, $(this).val())
		})
	};
	dy_taskinfo.refresh = function() {
		dy_taskinfo.set_task(h)
	};
	dy_taskinfo.set_task = function(a) {
		var c = $("#dy_bpan_info").children();
		if (a) {
			$(c[0]).hide();
			$(c[1]).show();
			c = a.state == DyEnums.TaskState.FINISH;
			$("#dy_ti_filepath").toggleClass("link2text", !c).siblings().toggle(c);
			for (var e in g) {
				var c = g[e],
					f = "dy_ti_" + e,
					d = c.fmt(a),
					b = $("#" + f);
				if ("*!<>?" == d) $("#" + f + "_tr").hide();
				else switch ($("#" + f + "_tr").show(), c.type) {
					case "link":
						b.attr("href", a[e]);
						b.html(d);
						break;
					case "string":
					case "button":
						b.html(d);
						break;
					case "text":
						b.val(d);
						break;
					case "number":
						b.val(d);
						break;
					case "textarea":
						b.val(d)
				}
			}
			h = a
		} else $(c[1]).hide(), $(c[0]).show(), h = null
	};
	dy_taskinfo.update_field = function(a) {
		var c = h;
		if ("naming" == a) setTimeout(function() {
			dy_taskinfo.update_field("filepath", null)
		}, 0);
		else if ("state" == a) {
			setTimeout(function() {
				dy_taskinfo.update_field("finished_bytes", null)
			}, 0);
			setTimeout(function() {
				dy_taskinfo.update_field("iconURL32", null)
			}, 0);
			var e = c.state == DyEnums.TaskState.FINISH;
			$("#dy_ti_filepath").toggleClass("link2text", !e).siblings().toggle(e)
		}
		if (e = g[a]) {
			var f = "dy_ti_" + a,
				d = e.fmt(c),
				b = $("#" + f);
			if ("*!<>?" == d) $("#" + f + "_tr").hide();
			else switch ($("#" + f + "_tr").show(), e.type) {
				case "link":
					b.attr("href", c[a]);
					b.html(d);
					break;
				case "string":
				case "button":
					b.html(d);
					break;
				case "text":
					b.val(d);
					break;
				case "number":
					b.val(d);
					break;
				case "textarea":
					b.val(d)
			}
		}
	};
	dy_taskinfo.update_progress = function() {
		dy_taskinfo.update_field("finished_bytes");
		dy_taskinfo.update_field("avgspeed");
		dy_taskinfo.update_field("time_elapsed")
	}
})();