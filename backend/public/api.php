<?php
header('Content-Type: application/json');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/api/health') {
    echo json_encode(['status' => 'ok']);
} 
else if ($path === '/api/projects') {
    echo json_encode([
        ['id' => 1, 'title' => 'Portfolio Website', 'description' => 'Full-stack portfolio'],
        ['id' => 2, 'title' => 'Chat App', 'description' => 'Real-time messaging'],
    ]);
}
else if ($path === '/api/skills') {
    echo json_encode([
        ['id' => 1, 'name' => 'PHP', 'proficiency' => 90],
        ['id' => 2, 'name' => 'Laravel', 'proficiency' => 85],
    ]);
}
else {
    echo json_encode(['message' => 'Portfolio API']);
}
?>
