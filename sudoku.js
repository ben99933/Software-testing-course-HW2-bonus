// sudoku.js
class SudokuBoard {
    constructor(grid) {
        // Deep copy the grid to prevent mutation of the original array
        this.grid = JSON.parse(JSON.stringify(grid));
        this.size = 9;
    }

    isValid(row, col, num) {
        // Check row
        for (let i = 0; i < this.size; i++) {
            if (this.grid[row][i] === num) {
                return false;
            }
        }

        // Check column
        for (let i = 0; i < this.size; i++) {
            if (this.grid[i][col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    findEmpty() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return [i, j]; // [row, col]
                }
            }
        }
        return null;
    }

    solve(randomize = false) {
        const find = this.findEmpty();
        if (!find) return true;
        
        const [row, col] = find;

        let numbers = Array.from({ length: 9 }, (_, i) => i + 1);
        if (randomize) {
            // Simple shuffle algorithm
            for (let i = numbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
        }

        for (const num of numbers) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                if (this.solve(randomize)) {
                    return true;
                }
                this.grid[row][col] = 0; // Backtrack
            }
        }
        return false;
    }
}

function generate(difficulty) {
    // Create an empty grid
    const emptyGrid = Array(9).fill(0).map(() => Array(9).fill(0));
    const solution = new SudokuBoard(emptyGrid);
    solution.solve(true); // Generate a full random board

    const puzzle = new SudokuBoard(solution.grid);
    
    // Remove numbers based on difficulty
    let cellsToRemove = difficulty;
    while (cellsToRemove > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzle.grid[row][col] !== 0) {
            puzzle.grid[row][col] = 0;
            cellsToRemove--;
        }
    }
    
    return { puzzle, solution };
}

module.exports = { SudokuBoard, generate };
