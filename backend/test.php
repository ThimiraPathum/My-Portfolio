<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=laravel', 'root', '');
    echo "Connection successful\n";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
