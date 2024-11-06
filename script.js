$(document).ready(function() {
    let boardId = 0;
    let cardId = 0;

    loadData();

    $('#add-board').click(function() {
        const boardTitle = prompt('Digite o título do quadro:');
        if (boardTitle) {
            addBoard(boardTitle);
        }
    });

    function addBoard(title) {
        boardId++;
        const boardHtml = `
            <div class="board" data-id="${boardId}">
                <div class="board-title">
                    <span><i class="fas fa-list"></i> ${title}</span>
                    <i class="fas fa-ellipsis-v board-menu"></i>
                </div>
                <div class="cards-container"></div>
                <button class="add-card"><i class="fas fa-plus"></i> Adicionar Card</button>
                <button class="delete-board"><i class="fas fa-trash"></i> Excluir Quadro</button>
            </div>
        `;
        $('#boards-container').append(boardHtml);

        saveBoard(boardId, title);

        $(`[data-id="${boardId}"] .add-card`).click(function() {
            const cardTitle = prompt('Digite o título do card:');
            if (cardTitle) {
                addCard($(this).closest('.board'), cardTitle);
            }
        });

        $(`[data-id="${boardId}"] .delete-board`).click(function() {
            if (confirm('Tem certeza que deseja excluir este quadro?')) {
                const board = $(this).closest('.board');
                deleteBoard(board.data('id'));
                board.remove();
            }
        });

        $(`[data-id="${boardId}"] .cards-container`).sortable({
            connectWith: ".cards-container",
            placeholder: "card-placeholder",
            update: function(event, ui) {
                if (this === ui.item.parent()[0]) {
                    updateCardPosition(ui.item.data('id'), $(this).closest('.board').data('id'));
                }
            }
        });
    }

    function addCard(board, title) {
        cardId++;
        const cardHtml = `
            <div class="card" data-id="${cardId}">
                <i class="fas fa-grip-lines"></i> ${title}
                <i class="fas fa-pencil-alt edit-card"></i>
                <i class="fas fa-trash-alt delete-card"></i>
            </div>
        `;
        board.find('.cards-container').append(cardHtml);

        saveCard(cardId, title, board.data('id'));

        addDragAndDropEvents();

        addCardEvents(board.find(`.card[data-id="${cardId}"]`));
    }

    function addCardEvents(card) {
        card.find('.edit-card').click(function(e) {
            e.stopPropagation();
            const newTitle = prompt('Digite o novo título do card:', card.text().trim());
            if (newTitle) {
                card.html(`
                    <i class="fas fa-grip-lines"></i> ${newTitle}
                    <i class="fas fa-pencil-alt edit-card"></i>
                    <i class="fas fa-trash-alt delete-card"></i>
                `);

                updateCardTitle(card.data('id'), newTitle);
            }
        });

        card.find('.delete-card').click(function(e) {
            e.stopPropagation();
            if (confirm('Tem certeza que deseja excluir este card?')) {
                card.remove();
                deleteCard(card.data('id'));
            }
        });
    }

    function addDragAndDropEvents() {
        $('.card').draggable({
            revert: 'invalid',
            cursor: 'move'
        });

        $('.cards-container').droppable({
            accept: '.card',
            drop: function(event, ui) {
                const droppedCard = ui.draggable;
                const targetBoard = $(this).closest('.board');
                $(this).append(droppedCard);

                updateCardPosition(droppedCard.data('id'), targetBoard.data('id'));
            }
        });
    }

    function loadData() {
        $.ajax({
            url: 'api.php',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                data.boards.forEach(function(board) {
                    addBoard(board.title);
                    board.cards.forEach(function(card) {
                        addCard($(`[data-id="${board.id}"]`), card.title);
                    });
                });
                boardId = data.maxBoardId;
                cardId = data.maxCardId;
            }
        });
    }

    function saveBoard(id, title) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                action: 'saveBoard',
                id: id,
                title: title
            }
        });
    }

    function saveCard(id, title, boardId) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                action: 'saveCard',
                id: id,
                title: title,
                boardId: boardId
            }
        });
    }

    function updateCardPosition(cardId, newBoardId) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                action: 'updateCardPosition',
                cardId: cardId,
                newBoardId: newBoardId
            }
        });
    }

    function updateCardTitle(cardId, newTitle) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                action: 'updateCardTitle',
                cardId: cardId,
                newTitle: newTitle
            }
        });
    }

    function deleteCard(cardId) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                action: 'deleteCard',
                cardId: cardId
            }
        });
    }

    function deleteBoard(boardId) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                action: 'deleteBoard',
                boardId: boardId
            }
        });
    }

    $('#boards-container').sortable({
        handle: '.board-title',
        update: function(event, ui) {

        }
    });

    $('#theme-toggle').click(function() {
        $('body').toggleClass('dark-theme');
        $(this).find('i').toggleClass('fa-moon fa-sun');
    });
});