'use strict';

$(document).ready(function(){

    var $btnSendFile    = $('button#sendFile'),
        $inpUrl         = $('#fileUrl'),
        $aceHolder      = $('#ace-holder'),
        $controlBtns    = $('.control-btns'),
        ajaxUrl         = window.location.href.replace(location.hash,"") + "api.php",
        lastUrl;

    $btnSendFile.click(function(){
        var url = $inpUrl.val();

        if(url.length == 0)
        {
            alert ('Введите ссылку.');
        }else
        {
            var status = App.checkUrl(url);

            if(!status)
            {
                alert("Некорректный link!");
            }else
            {
                var data = {
                    url : url,
                    method: "read"
                };

                $.ajax({
                    url: ajaxUrl,
                    method: "POST",
                    data: data,
                    dataType: "json",
                    success: function(results){

                        if(results.error)
                        {
                            alert("Ошибка на сервере!\n" + results.error);
                            console.error("error", results.error);
                            return;
                        }

                        var contentType = results.content_type,
                            content = results.content;

                        if (contentType !== undefined && contentType !== false)
                        {
                            var mode = App.checkMimeType(results.content_type);

                            if(mode){
                                $aceHolder.addClass("active");
                                $controlBtns.find('a').removeClass('disabled');
                                lastUrl = url;

                                Editor.init($aceHolder.attr("id"));
                                Editor.setContent(mode, content);
                            }else
                            {
                                alert("Тип файла: "+results.content_type+" не поддерживается!");
                            }

                        }else {
                            alert("Некорректный URL.");
                        }
                    },
                    error: function (request, status, error) {
                        console.log(status, request.responseText);
                    }
                });
            }
        }
    });

    $controlBtns.on('click', "a", function(e){

        e.stopPropagation();
        e.preventDefault();

        var id = $(this).attr("id");

        switch (id) {
            case "editor-clean":
                Editor.cleanContent();
                break;
            case "editor-save":
                var content = Editor.getContent();

                if(content == ""){
                    alert("Empty");
                    return;
                }

                var data = {
                    method: "save",
                    content: content,
                    nameIsUrl: lastUrl
                };

                $.ajax({
                    url: ajaxUrl,
                    method: "POST",
                    data: data,
                    dataType: "json",
                    success: function(results){

                        if(results.error)
                        {
                            alert("Ошибка на сервере!\n" + results.error);
                            console.error("error", results.error);
                            return;
                        }

                        var status = results.fileStatus,
                            message;

                        switch (status) {
                            case "created" :
                                message = "сохранен";
                                break;
                            case "updated" :
                                message = "обновлен";
                                break;
                        }

                        alert('Файл '+message+".");
                        showSavedFiles();
                    },
                    error: function (request, status, error) {
                        console.error(status, request.responseText);
                    }
                });

                break;
            default:
        }

        return false;
    });

    function showSavedFiles(){
        var $listOfFiles = $("ul#listOfFiles");

        $.ajax({
            url: ajaxUrl,
            method: "POST",
            data: {method : "getSavedFiles"},
            dataType: "json",
            success: function(results){

                if(results.error)
                {
                    alert("Ошибка на сервере!\n" + results.error);
                    console.error("error", results.error);
                    return;
                }

                buildList(results.files);
                //console.log(results);
            },
            error: function (request, status, error) {
                console.error(status, request.responseText);
            }
        });

        function buildList(files){

            if(files === "empty") return;
            $listOfFiles.html("");

            $.each(files, function( index, value ) {

                var dataName = value,
                    fileName = value.split("-");

                fileName = fileName[fileName.length - 1];

                var fileHolder = '<li data-name="'+dataName+'" class="list-group-item">'+fileName+'</li>'

                $(fileHolder).appendTo($listOfFiles);
            });
        }
    }
    showSavedFiles();
});

// global vars

var Editor = {
    editor: "",

    init : function (id) {

        var editor = this.editor = ace.edit(id);
        //editor.setTheme("ace/theme/monokai");
    },
    setContent : function (mode, content){
        var editor = this.editor;

        editor.getSession().setMode("ace/mode/" + mode);
        editor.setValue(content);
        editor.gotoLine(0);
    },
    getContent : function () {
        var editor = this.editor;

        return editor.getValue();
    },
    cleanContent : function () {
        var editor = this.editor;

        editor.setValue("");
        editor.getSession().setMode("ace/mode/text");
    }
};

var App = {

    checkUrl : function( url ){

        var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

        var extention = url.split(".");

        extention = extention[extention.length - 1];

        if (regex.test(url))
        {
            if (["html","js","css"].indexOf(extention) !== -1)
            {
                return true;
            }
        }

        return false;
    },

    checkMimeType : function (mimeType){

        var mode = false,
            supportedMimeTypes = [
                "text/css",
                "text/html",
                "text/javascript", //устаревший
                "application/json",
                "application/javascript"
            ];

        supportedMimeTypes.forEach(function(item, i, arr) {

            if(mimeType.search(item) >= 0)
            {
                mode = supportedMimeTypes[i].split('/')[1];
            }
        });

        return mode;
    }
};
