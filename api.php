<?php
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'kanban_db';
$user = 'seu_usuario';
$pass = 'sua_senha';

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Carregar dados
    $boards = $pdo->query("SELECT * FROM boards")->fetchAll(PDO::FETCH_ASSOC);
    $cards = $pdo->query("SELECT * FROM cards")->fetchAll(PDO::FETCH_ASSOC);

    $maxBoardId = $pdo->query("SELECT MAX(id) FROM boards")->fetchColumn();
    $maxCardId = $pdo->query("SELECT MAX(id) FROM cards")->fetchColumn();

    $result = [
        'boards' => $boards,
        'cards' => $cards,
        'maxBoardId' => $maxBoardId,
        'maxCardId' => $maxCardId
    ];

    echo json_encode($result);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    if ($action === 'saveBoard') {
        $id = $_POST['id'];
        $title = $_POST['title'];
        $stmt = $pdo->prepare("INSERT INTO boards (id, title) VALUES (?, ?)");
        $stmt->execute([$id, $title]);
    } elseif ($action === 'saveCard') {
        $id = $_POST['id'];
        $title = $_POST['title'];
        $boardId = $_POST['boardId'];
        $stmt = $pdo->prepare("INSERT INTO cards (id, title, board_id) VALUES (?, ?, ?)");
        $stmt->execute([$id, $title, $boardId]);
    } elseif ($action === 'updateCardPosition') {
        $cardId = $_POST['cardId'];
        $newBoardId = $_POST['newBoardId'];
        $stmt = $pdo->prepare("UPDATE cards SET board_id = ? WHERE id = ?");
        $stmt->execute([$newBoardId, $cardId]);
    } elseif ($action === 'updateCardTitle') {
        $cardId = $_POST['cardId'];
        $newTitle = $_POST['newTitle'];
        $stmt = $pdo->prepare("UPDATE cards SET title = ? WHERE id = ?");
        $stmt->execute([$newTitle, $cardId]);
    } elseif ($action === 'deleteCard') {
        $cardId = $_POST['cardId'];
        $stmt = $pdo->prepare("DELETE FROM cards WHERE id = ?");
        $stmt->execute([$cardId]);
    } elseif ($action === 'deleteBoard') {
        $boardId = $_POST['boardId'];
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("DELETE FROM cards WHERE board_id = ?");
            $stmt->execute([$boardId]);
            $stmt = $pdo->prepare("DELETE FROM boards WHERE id = ?");
            $stmt->execute([$boardId]);
            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
    }

    echo json_encode(['success' => true]);
}