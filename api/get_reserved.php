<?php

error_reporting(-1);

set_include_path("./includes/");
require_once("mysqli.php");

$dateList ="";
$monthList = "";
$yearList = "";

$dateList = mysqli_real_escape_string($mysqli, strip_tags(trim($_GET["dateListText"])));
$monthList = mysqli_real_escape_string($mysqli, strip_tags(trim($_GET["monthListText"])));
$yearList = mysqli_real_escape_string($mysqli, strip_tags(trim($_GET["yearListText"])));

$dateListArray = explode(',', $dateList);
$monthListArray = explode(',', $monthList);
$yearListArray = explode(',', $yearList);


for($i = 0; $i < count($dateListArray)-1; $i++)
{
    if($dateListArray[$i] > $dateListArray[$i+1])
    {
        $dateListHigher = array_slice($dateListArray, 0, $i+1);
        $dateListHigher = implode(',', $dateListHigher);
        $dateListLower = array_slice($dateListArray, $i+1);
        $dateListLower = implode(',', $dateListLower);
        break;
    }
    elseif($i == count($dateListArray)-2)
    {
        $dateListHigher = $dateListArray;
        $dateListHigher = implode(',', $dateListHigher);
        $dateListLower = $dateListArray;
        $dateListLower = implode(',', $dateListLower);
    }
}

if (count($yearListArray) == 1)
{
    $yearListLower = implode(',', $yearListArray);
    $yearListHigher = implode(',', $yearListArray);
}
else
{
    $yearListLower = implode(',', array_slice($yearListArray, 0, 1));
    $yearListHigher = implode(',', array_slice($yearListArray, 1));
}

if (count($monthListArray) == 1)
{
    $monthListHigher = implode(',', $monthListArray);
    $monthListLower = implode(',', $monthListArray);
}
else
{
    $monthListHigher = implode(',', array_slice($monthListArray, 0, 1));
    $monthListLower = implode(',', array_slice($monthListArray, 1));
}


if (!isset($resultData)) 
    $resultData = new stdClass();
$resultData->status = "fail";
$resultData->data[] = array();

$sql = "SELECT "
    . "`start_time`, "
    . "`end_time`, "
    . "`date`, "
    . "`table_chosen` "
    . "FROM `baldwin_tables_reservations` "
    . "WHERE (`year` = " . $yearListLower . " AND `month` = " . $monthListHigher . " AND `date` in (" . $dateListHigher . "))"
    . "OR (`year` = " . $yearListHigher . " AND `month` = " . $monthListLower . " AND `date` in (" . $dateListLower . "))";

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