<?php

if (!empty($_POST))
{
    $data = array(
        "url" => formatstr($_POST["url"]),
        "method" => formatstr($_POST["method"])
    );

    switch ($data['method']) {
        case "read" :
            $response = fileGetContentsCurl($data['url']);
            break;
        case "save" :
            $response = false;
            break;
        default :
            $response = false;
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
        $message['error'] = "cURL is NOT installed on this server";
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

function _is_curl_installed() {
    if  (in_array  ('curl', get_loaded_extensions())) {
        return true;
    }
    else {
        return false;
    }
}
?>