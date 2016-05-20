'use strict';

$(document).ready(function(){

    var $btnSendFile    = $('button#sendFile'),
        $inpUrl         = $('#fileUrl'),
        $aceHolder      = $('#ace-holder');

    editor = ace.edit("ace-holder");

    $btnSendFile.click(function(){
        var url = $inpUrl.val();

        if(url.length == 0)
        {
            alert ('Введите ссылку.');

        }else
        {
            var status = app.checkUrl(url);

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
                    url: './api.php',
                    method: "POST",
                    data: data,
                    dataType: "json",
                    success: function(results){

                        if(results.error)
                        {
                            alert("Ошибка на сервере!");
                            console.log("error", results.error);
                            return;
                        }

                        var contentType = results.content_type,
                            content = results.content;

                        if (contentType !== undefined && contentType !== false)
                        {
                            var mode = app.checkMimeType(results.content_type);

                            if(mode){
                                aceInit( mode, content);
                            }

                        }else {
                            alert("Некорректный URL.");
                        }
                    },
                    error: function(jqxhr, status, error) {
                        console.log('error:');
                        var err = eval("(" + jqxhr.responseText + ")");
                        console.log(status, err.Message, error);
                    }
                });
            }
        }
    });

    function aceInit( mode, content){
        $aceHolder.addClass("active");

        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/" + mode);
        editor.setValue(content);
        editor.gotoLine(0);
    }

});

// global vars
var editor;

var app = {
    ajaxFile : "./api.php",

    checkUrl : function( url ){

        var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

        return regex.test(url);
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
    },

    read : function(data) {

    },
    /*error : function (message){
        console.log(message);
        alert("Что-то пошло не так смотри консоль!");
    }*/
};
