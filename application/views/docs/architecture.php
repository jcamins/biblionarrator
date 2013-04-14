<?php

use \Michelf\Markdown;

$text = file_get_contents('architecture.md');
echo Markdown::defaultTransform($text);
?>
