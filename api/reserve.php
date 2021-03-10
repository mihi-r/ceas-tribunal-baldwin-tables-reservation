<?php

error_reporting(-1);

set_include_path("./includes/");
require_once("mysqli.php");

$eventTitle = "";
$name = "";
$orgName = "";
$email = "";
$month = 0;
$date = 0;
$year = 0;
$weekday = 0;
$startTime = "";
$endTime = "";
$tableChosen = "";
$comments = "";

$eventTitle = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["eventTitleText"])));
$name = preg_replace("/[^A-Za-z0-9 ]/", '', mysqli_real_escape_string($mysqli, $_POST["nameText"]));
$orgName = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["orgNameText"])));
$email = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["emailText"])));
$month = (int)$_POST["monthText"];
$date = (int)$_POST["dateText"];
$year = (int)$_POST["yearText"];
$weekday = (int)$_POST["weekdayText"];
$startTime = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["startTimeText"])));
$endTime = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["endTimeText"])));
$tableChosen = mysqli_real_escape_string($mysqli, strip_tags(trim($_POST["tableChosenText"])));
$comments = mysqli_real_escape_string($mysqli, htmlentities(trim($_POST["commentsText"]), ENT_NOQUOTES));

if (!isset($resultData)) 
	$resultData = new stdClass();
	
$resultData->status = "fail";

if (strlen($eventTitle) > 256) {
	$resultData->data = "The event title field exceeds 256 characters. Please shorten your event title.";
	echo json_encode($resultData);
	die();
}

if (strlen($name) > 256) {
	$resultData->data = "The name field exceeds 256 characters. Please shorten your name.";
	echo json_encode($resultData);
	die();
}

if (strlen($orgName) > 256) {
	$resultData->data = "The organization name field exceeds 256 characters. Please shorten your organization's name.";
	echo json_encode($resultData);
	die();
}

if(!preg_match('/^[\w\W]+@[\w\W\d]{1,256}$/', $email)) {
    $resultData->data = 'Your email, ' . $email . ', is invalid. Please use an email in the following format: <>@<>. '
        . 'Your email is also limited to 256 characters.';
    echo json_encode($resultData);
    die();
}

if (strlen($comments) > 500) {
	$resultData->data = "The comments field exceeds 500 characters. Please choose a shorter email to proceed.";
	echo json_encode($resultData);
	die();
}

$isQuerySuccess = TRUE;
$adminEmail = "";

$sql = "SELECT admin_email FROM baldwin_tables_info WHERE id=1";
$result = $mysqli->query($sql);

if (!$result) {
	$isQuerySuccess = FALSE;
} else {
	while ($row = $result->fetch_assoc()) {
		$adminEmail = $row['admin_email'];
	}

	if ($adminEmail == "") {
		$isQuerySuccess = FALSE;
	} else {
		$sql = "INSERT INTO baldwin_tables_reservations (event_title, name, org_name, 
			email, month, date, year, weekday, start_time, end_time, table_chosen, comments)
			VALUES ('".$eventTitle."','".$name."','".$orgName."','".$email."','".$month."',
			'".$date."','".$year."','".$weekday."','".$startTime."','".$endTime."','".$tableChosen."',
			'".$comments."')";

			$result = $mysqli->query($sql);

			// Update baldwin tables
			if (!$result) {
				$isQuerySuccess = FALSE;
			} else {
				$resultData->status = "success";
				$resultData->data = $mysqli->insert_id;
				echo json_encode($resultData);
			}

	}
}

if (!$isQuerySuccess) {
	$resultData->data = "An unknown error occurred.";
	echo json_encode($resultData);
	die();
}

$table = $tableChosen . " table";
if ($tableChosen == "leftright") {
	$table = "left and right tables";
}

$emailSubject = "Baldwin Tables Reservation Request Submitted";

$emailMsg = "Hello " . $name . ", \n \n";
$emailMsg .= "We have recieved your request to schedule an event for the " . $table . " in Baldwin Hall 600. ";
$emailMsg .= "Your requested event, " . $eventTitle . ", will tentatively take place on " . ($month + 1) . "/" . $date . "/" . $year . " at " . $startTime . " - " . $endTime . ". ";
$emailMsg .= "Your request will not be confirmed until it is approved by us. Please allow 1-3 days to either approve or deny your request. \n \n";
$emailMsg .= "The Reservation ID for this request: " . $reservationId . "\n \n";
$emailMsg .= "Your Reservation ID will be helpful for us to identify your request. ";
$emailMsg .= "In addition to tracking your status, you will receive an email once your approval has been decided. ";
$emailMsg .= "If you have any questions or like to make changes to your reservation, feel free to reply back to this email or email us anytime with the Reservation ID. ";
$emailMsg .= "Best regards, \n";
$emailMsg .= "CEAS Tribunal";

$emailHeaders = "From: " . $adminEmail;

mail($email, $emailSubject, $emailMsg, $emailHeaders);

mysqli_close($mysqli);
exit();
?>