<?php

//error_reporting(E_ALL);

if (!empty($_POST))
{
    $postData = array();

    foreach($_POST as $name => $val){
        $postData[$name] = formatstr($val);
    }

    $response = false;
    
    if (isset($postData['method'])) {
        switch ($postData['method']) {
            case "read" :
                $response = fileGetContentsCurl($postData['url']);
                break;
            case "save" :
                if(isset($postData['$name']) && isset($postData['content']))
                {

                }elseif (isset($postData['nameIsUrl']) && isset($postData['content']))
                {
                    $url = $postData['nameIsUrl'];
                    $fileContent = $postData['content'];

                    $fileName = createNameFromUrl($url);

                    $response = saveFile($fileName, $fileContent);

                }else
                {
                    $response = false;
                }
                break;
            case "getSavedFiles":
                $response = getSavedFiles();
                break;
            default :
        }
    }
    
    if(!$response) 
    {
        echo json_encode(array(
              "error" => "Wrong Post vars;"
          ));
        
    }

    echo $response;
}
else // $_POST пустой.
{
    die ("Perform code for page without POST data. ");
}

// очищаем $_POST данные
function formatstr($str)
{
    $str = trim($str);
    $str = stripslashes($str);
    $str = htmlspecialchars($str);
    return $str;
}

function fileGetContentsCurl($url, $headers = null)
{
    //проверяем встановлен ли curl на сервере
    if ( !in_array('curl', get_loaded_extensions()) )
    {
        //http_response_code(500);
        //die("cURL is NOT installed on this server");
        $message['error'] = "CURL is NOT installed on this server";
        echo json_encode($message);
        exit;
    }

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);

    if(is_array($headers) && !empty($headers)){
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }else{
        curl_setopt($ch, CURLOPT_HEADER, 0);
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);

    $content = curl_exec($ch);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    $info = curl_getinfo($ch);
    $http_code = $info["http_code"];
    //$contentType = $info["content_type"];

    if($http_code === 404) $content = $http_code;

    curl_close($ch);

    if($content === 404) {
        $message['error'] = "file status" . $content;
    }else {
        $message['content'] = $content;
        $message['content_type'] = $contentType;
    }

    return json_encode($message);
}

// from http://my.ovobox.com/js/ovolib.js
// to   http-my.ovobox.com-js-ovolib.js
function createNameFromUrl($str) {
    $str = strip_tags($str);
    $str = preg_replace('/[\r\n\t ]+/', ' ', $str);
    $str = preg_replace('/[\"\*\/\:\<\>\?\'\|]+/', ' ', $str);
    $str = strtolower($str);
    $str = html_entity_decode( $str, ENT_QUOTES, "utf-8" );
    $str = htmlentities($str, ENT_QUOTES, "utf-8");
    $str = preg_replace("/(&)([a-z])([a-z]+;)/i", '$2', $str);
    $str = str_replace(' ', '-', $str);
    $str = rawurlencode($str);
    $str = str_replace('%', '-', $str);
    return $str;
}

function saveFile($name, $content){
    $dirPath = "./files/";
    $filePath = $dirPath . $name;

    try
    {
        //throw new Exception('Some problems');
        if (!file_exists($dirPath)) {
            mkdir($dirPath, 0755, true);
        }

        $fileStatus = file_exists($filePath);

        $fh = fopen($filePath, 'w');
        fwrite($fh, $content);
        fclose($fh);

        //$finfo = finfo_open(FILEINFO_MIME_TYPE); // return mime type ala mimetype extension
        //echo finfo_file($finfo, $filePath) . "\n";
        //finfo_close($finfo);

        return json_encode(array(
            "fileStatus" => $fileStatus ? "updated" : "created"
        ));


    } catch (Exception $e)
    {
        //echo $e->getMessage();
        return json_encode(
            array(
                "error" => "Server problems with file saving."
            )
        );
    } finally {
        //echo 123;
    }

}

function getSavedFiles(){
    $dirPath = "./files/";//это нужно вынести в файл конфига
//    $files = scandir($dirPath);

    if (!file_exists($dirPath)) {
        $files = "empty";
    }else{
        $files = array_diff(scandir($dirPath), array('..', '.'));
        $files = $files ? array_values($files) : "empty";
    }


    return json_encode(
        array(
            "files" => $files));
}

?>