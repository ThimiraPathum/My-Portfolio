<?php
echo "<h1>Diagnostic Info</h1>";
echo "PHP is working! Port: " . getenv('PORT') . "<br>";
echo "APP_KEY exists: " . (getenv('APP_KEY') ? 'Yes' : 'No') . "<br>";
echo "APP_ENV: " . getenv('APP_ENV') . "<br>";

echo "<h2>File Checks</h2>";
$files = ['/app/vendor/autoload.php', '/app/database/database.sqlite'];
foreach ($files as $file) {
    echo "$file exists: " . (file_exists($file) ? '✅' : '❌') . "<br>";
}

echo "<h2>Directory Checks</h2>";
$dirs = ['/app/storage', '/app/bootstrap/cache', '/app/database'];
foreach ($dirs as $dir) {
    echo "$dir writable: " . (is_writable($dir) ? '✅' : '❌') . "<br>";
}

echo "<h2>Environment Variables</h2>";
echo "<pre>";
print_r($_ENV);
echo "</pre>";

phpinfo();
?>
