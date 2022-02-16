<?php
    include "constants.php";

    // API Methods
    // Use sqlSelect and sqlExec to access the database 
    // Functions that don't have a header are not exposed to the API

    function validateConsumer($user, $pass){
        // TODO: Implement user validation
        // this method should return a size 3 array where the first element is
        // the user id (null if invalid), the second is the consumer level and the
        // third is the consumer role
        
        // Access check after validation:
        //    1. If the method has a level atribute, consumer level must be equal or higher
        //    2. If the method has a role atribute, consumer role must be included in the list
        // If there is a condition applies but fails, validation fails


        //Return example
        return [1, 2, ["admin", "rrhh"]];
    }


    // This is an example API Method (Exposed Function)
    // Base export header:
    //      //*  *// Method
    // Complet header example:
    //      //* level: 1, role: rrhh supervisor, rename: other_name *// Method
    // Spaces are not permited in any atribute but role may contain
    // multiple values separated by spaces

    //*  *// Method
    function test($text){
        return "Hola ".$text;
    }
?>