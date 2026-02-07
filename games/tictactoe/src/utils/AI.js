export class AI {
  static bestMove(board) {
    let bestScore = -Infinity;
    let move;

    // Identify available spots
    let availableSpots = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          availableSpots.push({ i, j });
        }
      }
    }

    // Check if it's the first move (optimization)
    if (availableSpots.length === 9 || availableSpots.length === 8) {
      // Return center or a corner if available, basic optimization
      const center = { i: 1, j: 1 };
      if (board[1][1] === "") return center;
      return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = "O"; // AI is 'O'
          let score = AI.minimax(board, 0, false);
          board[i][j] = ""; // Undo
          if (score > bestScore) {
            bestScore = score;
            move = { i, j };
          }
        }
      }
    }
    return move;
  }

  static minimax(board, depth, isMaximizing) {
    let resultObj = AI.checkWinner(board);
    if (resultObj !== null) {
      let result = resultObj.winner;
      return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === "") {
            board[i][j] = "O";
            let score = AI.minimax(board, depth + 1, false);
            board[i][j] = "";
            bestScore = Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === "") {
            board[i][j] = "X";
            let score = AI.minimax(board, depth + 1, true);
            board[i][j] = "";
            bestScore = Math.min(score, bestScore);
          }
        }
      }
      return bestScore;
    }
  }

  static checkWinner(board) {
    // Rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== '') {
            return { winner: board[i][0], line: [{r:i, c:0}, {r:i, c:1}, {r:i, c:2}] };
        }
    }
    // Cols
    for (let i = 0; i < 3; i++) {
        if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== '') {
            return { winner: board[0][i], line: [{r:0, c:i}, {r:1, c:i}, {r:2, c:i}] };
        }
    }
    // Diagonals
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '') {
        return { winner: board[0][0], line: [{r:0, c:0}, {r:1, c:1}, {r:2, c:2}] };
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== '') {
        return { winner: board[0][2], line: [{r:0, c:2}, {r:1, c:1}, {r:2, c:0}] };
    }

    // Open spots
    let openSpots = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') {
                openSpots++;
            }
        }
    }

    if (openSpots === 0) {
        return { winner: 'tie', line: null };
    }

    return null;
  }
}
