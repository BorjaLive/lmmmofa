<?php
    include "main.php";

    // The only API endpoint
    // Validates, executes the required method and returns the result
    
    try{
        $INPUT = json_decode(file_get_contents("php://input"), true);
        $ACTION_LEVELS = json_decode(file_get_contents("actions.json"), true);

        $action = sGet("action");

        $link = conn();
        
        //Verificar que la acción existe
        if(!isset($ACTION_LEVELS[$action])){
            echo json_encode(array("status" => "error", "msg" => ["error" => "Action not recognized"]));
            die();
        }

        //Obtener el nivel de permisos del ejecutor y su usuario, si tiene
        list($consumerId, $level, $role) = validateConsumer(isset($_SERVER['PHP_AUTH_USER'])?$_SERVER['PHP_AUTH_USER']:null, isset($_SERVER['PHP_AUTH_PW'])?$_SERVER['PHP_AUTH_PW']:null);

        //Comprobar si el ejecutor tiene permiso para la acción
        if((isset($ACTION_LEVELS[$action]["level"]) && $ACTION_LEVELS[$action]["level"] > $level) || 
           (isset($ACTION_LEVELS[$action]["role"]) && count(array_intersect($ACTION_LEVELS[$action]["role"], $role)) === 0)){
            echo json_encode(array("status" => "error", "msg" => ["error" => "Insufficient permission level"]));
            die();
        }

        //Obtener parametros y llamar a la función
        $parameters = [];
        foreach(func_get_args_names($action) as $parameter){
            $parameters[] = sGet($parameter);
        }
        $resoult = call_user_func_array($action, $parameters);
        $data = ["status" => "success", "msg" => $resoult];
    
        if($link) $link->close();
    }catch(Exception $e){
        $data = array("status" => "error", "msg" => ["error" => $e->getMessage()]);
    }

    echo json_encode($data);

    function sGet($key){
        global $INPUT;
        if(isset($INPUT[$key]))
            return $INPUT[$key];
        else
            return null;
    }
?>