<?php

error_reporting(-1);

set_include_path("./includes/");
require_once("mysqli.php");

$name = "";
$email = "";


$sql = "SELECT admin_name, admin_email FROM baldwin_tables_info ORDER BY id LIMIT 1";

$result = $mysqli->query($sql);

if (!isset($result_data))
    $result_data = new stdClass();

$result_data->status = "fail";

if($result){
    $result_data->data = $result->fetch_assoc();
    $result_data->status = "success";
}

echo json_encode($result_data);
mysqli_close($mysqli);
?>