<?php{{composerLine}}
    include "installation_constants.php";

    function conn(){
        if(!SQL_HOST) return null;
        return new mysqli(SQL_HOST, SQL_USER, SQL_PASS, SQL_BASE);
    }

    function sqlSelect($sql, $paramsType = null, $params = null) {
        global $link;
    
        $stmt = $link->prepare($sql);
        if ($link->error) throw new Exception($link->error);
        if ($stmt->error) throw new Exception($stmt->error);
        if ($paramsType != null && $params != null) $stmt->bind_param($paramsType, ...$params);
        if ($link->error) throw new Exception($link->error);
        if ($stmt->error) throw new Exception($stmt->error);
        $stmt->execute();
        if ($link->error) throw new Exception($link->error);
        if ($stmt->error) throw new Exception($stmt->error);
        $res = $stmt->get_result();
        if ($link->error) throw new Exception($link->error);
        if ($stmt->error) throw new Exception($stmt->error);
    
        $datas = [];
        while ($data = $res->fetch_array(MYSQLI_ASSOC)) {
            $datas[] = $data;
        }
        $stmt->close();
        if ($link->error) throw new Exception($link->error);
    
        return $datas;
    }

    function sqlExec($sql, $paramsType = null, $params = null) {
        global $link;
    
        $stmt = $link->prepare($sql);
        if ($link->error) throw new Exception($link->error);
        if ($stmt->error) throw new Exception($stmt->error);
        if ($paramsType != null && $params != null) $stmt->bind_param($paramsType, ...$params);
        if ($link->error) throw new Exception($link->error);
        if ($stmt->error) throw new Exception($stmt->error);
        $stmt->execute();
        if ($link->error) throw new Exception($link->error);
        if ($stmt->error) throw new Exception($stmt->error);
        $stmt->close();
        if ($link->error) throw new Exception($link->error);
    
        return $link->insert_id;
    }

    function func_get_args_names($func) {
        $f = new ReflectionFunction($func);
        $result = array();
        foreach ($f->getParameters() as $param) {
            $result[] = $param->name;
        }
        return $result;
    }
?>