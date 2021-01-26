<?php

error_reporting(-1);
//set_include_path('/web/sites/www.tribunal.uc.edu/htdocs/resume-review-day/students/includes/');
//require_once("mysqli.php");

set_include_path("./includes/");
require_once("mysqli.php");

$dateList ="";
$monthList = "";
$yearList = "";

$dateList = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["dateListText"])));
$monthList = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["monthListText"])));
$yearList = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["yearListText"])));

if (!isset($resultData)) 
    $resultData = new stdClass();
$resultData->status = "fail";
$resultData->data[] = array();

$sql = "SELECT start_time, end_time, date, table_chosen "
    . "FROM baldwin_tables_reservations "
    . "WHERE year IN (" . $yearList . ") AND month IN (" . $monthList . ") AND date in (" . $dateList . ")";
$result = $mysqli->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $resultData->data[] = $row;
    }
    $resultData->status = "success";
    echo json_encode($resultData);
} else {
    echo "An unknown error occured.";
    die();
}

mysqli_close($mysqli);
exit();
?>