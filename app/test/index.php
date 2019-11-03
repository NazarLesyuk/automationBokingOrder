<?php
$date = new DateTime();
$filename = __DIR__.'/log.txt';
$reportData = "--".$date->format('Y-m-d\, H:i:s ').PHP_EOL;
file_put_contents($filename, $reportData, FILE_APPEND | LOCK_EX);

echo json_encode($reportData);