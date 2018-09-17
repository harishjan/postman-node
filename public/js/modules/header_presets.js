pm.headerPresets = {
    presets:[],
    presetsForAutoComplete:[],

    init:function () {
        pm.headerPresets.loadPresets();

        var params = {
            placeHolderKey:"Key",
            placeHolderValue:"Value",
            deleteButton:'<img class="deleteButton" src="img/delete.png">'
        };

        $("#header-presets-keyvaleditor").keyvalueeditor("init", params);
        $("#headers-keyvaleditor-actions-manage-presets").on("click", function () {
            pm.headerPresets.showManager();
        });

        $(".header-presets-actions-add").on("click", function () {
            pm.headerPresets.showEditor();
        });

        $(".header-presets-actions-back").on("click", function () {
            pm.headerPresets.showList();
        });

        $(".header-presets-actions-submit").on("click", function () {
            var itemid = $('#header-presets-editor-id').val();
            if (itemid === "0") {
                pm.headerPresets.addHeaderPreset();
            }
            else {
                var name = $('#header-presets-editor-name').val();
                var headers = $("#header-presets-keyvaleditor").keyvalueeditor("getValues");
                pm.headerPresets.editHeaderPreset(itemid, name, headers);
            }

            pm.headerPresets.showList();
        });

        $("#header-presets-list").on("click", ".header-preset-action-edit", function () {
            var itemid = $(this).attr("data-id");
            var preset = pm.headerPresets.getHeaderPreset(itemid);
            $('#header-presets-editor-name').val(preset.name);
            $('#header-presets-editor-id').val(preset.itemid);
            $('#header-presets-keyvaleditor').keyvalueeditor('reset', preset.headers);
            pm.headerPresets.showEditor();
        });

        $("#header-presets-list").on("click", ".header-preset-action-delete", function () {
            var itemid = $(this).attr("data-id");
            pm.headerPresets.deleteHeaderPreset(itemid);
        });
    },

    loadPresets:function () {
        pm.indexedDB.headerPresets.getAllHeaderPresets(function (items) {
            pm.headerPresets.presets = items;
            pm.headerPresets.refreshAutoCompleteList();
            $('#header-presets-list tbody').html("");
            $('#header-presets-list tbody').append(Handlebars.templates.header_preset_list({"items":items}));
        });
    },

    showManager:function () {
        $("#modal-header-presets").modal("show");
    },

    showList:function () {
        $("#header-presets-list-wrapper").css("display", "block");
        $("#header-presets-editor").css("display", "none");
        $("#header-presets-editor-name").attr("value", "");
        $("#header-presets-editor-id").attr("value", 0);
        $('#header-presets-keyvaleditor').keyvalueeditor('reset', []);
        $("#modal-header-presets .modal-footer").css("display", "none");
    },

    showEditor:function () {
        $("#modal-header-presets .modal-footer").css("display", "block");
        $("#header-presets-list-wrapper").css("display", "none");
        $("#header-presets-editor").css("display", "block");
    },

    getHeaderPreset:function (itemid) {
        for (var i = 0, count = pm.headerPresets.presets.length; i < count; i++) {
            if (pm.headerPresets.presets[i].itemid === itemid) break;
        }

        var preset = pm.headerPresets.presets[i];
        return preset;
    },

    addHeaderPreset:function () {
        var name = $("#header-presets-editor-name").val();
        var headers = $("#header-presets-keyvaleditor").keyvalueeditor("getValues");
        var itemid = guid();

        var headerPreset = {
            "itemid":itemid,
            "name":name,
            "headers":headers,
            "timestamp":new Date().getTime()
        };

        pm.indexedDB.headerPresets.addHeaderPreset(headerPreset, function () {
            pm.headerPresets.loadPresets();
        });
    },

    editHeaderPreset:function (itemid, name, headers) {
        pm.indexedDB.headerPresets.getHeaderPreset(itemid, function (preset) {
            var headerPreset = {
                "itemid":itemid,
                "name":name,
                "headers":headers,
                "timestamp":preset.timestamp
            };

            pm.indexedDB.headerPresets.updateHeaderPreset(headerPreset, function () {
                pm.headerPresets.loadPresets();
            });
        });
    },

    deleteHeaderPreset:function (itemid) {
        pm.indexedDB.headerPresets.deleteHeaderPreset(itemid, function () {
            pm.headerPresets.loadPresets();
        });
    },

    getPresetsForAutoComplete:function () {
        var list = [];
        for (var i = 0, count = pm.headerPresets.presets.length; i < count; i++) {
            var preset = pm.headerPresets.presets[i];
            var item = {
                "itemid":preset.itemid,
                "type":"preset",
                "label":preset.name,
                "category":"Header presets"
            };

            list.push(item);
        }

        return list;
    },

    refreshAutoCompleteList:function () {
        var presets = pm.headerPresets.getPresetsForAutoComplete();
        pm.headerPresets.presetsForAutoComplete = _.union(presets, chromeHeaders);
    }
};