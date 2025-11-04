// sudoku.test.js
const { SudokuBoard } = require('./sudoku');

describe('SudokuBoard', () => {
    let board;
    const initialGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    beforeEach(() => {
        board = new SudokuBoard(initialGrid);
    });

    test('isValid should correctly validate number placement', () => {
        // Test valid placement
        expect(board.isValid(0, 2, 4)).toBe(true);

        // Test row conflict
        expect(board.isValid(0, 2, 5)).toBe(false);

        // Test column conflict
        expect(board.isValid(0, 2, 8)).toBe(false);

        // Test 3x3 box conflict
        expect(board.isValid(1, 1, 9)).toBe(false);
    });

    test('solve should find a valid solution for a solvable puzzle', () => {
        const solutionGrid = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];
        
        expect(board.solve()).toBe(true);
        expect(board.grid).toEqual(solutionGrid);
    });
});

// Test for puzzle generator
describe('generate', () => {
    test('should generate a puzzle with a specified number of empty cells', () => {
        const { generate } = require('./sudoku');
        const difficulty = 45; // Number of cells to remove
        const { puzzle, solution } = generate(difficulty);

        // 1. Validate the number of empty cells
        const emptyCells = puzzle.grid.flat().filter(cell => cell === 0).length;
        expect(emptyCells).toBe(difficulty);
        
        // 2. Validate that puzzle is solvable
        const puzzleCopy = new SudokuBoard(puzzle.grid);
        expect(puzzleCopy.solve()).toBe(true);

        // 3. Validate that all numbers in solution are valid
        const isValidSolution = solution.grid.every((row, i) => 
            row.every((num, j) => {
                const temp = solution.grid[i][j];
                solution.grid[i][j] = 0;
                const isValid = solution.isValid(i, j, temp);
                solution.grid[i][j] = temp;
                return isValid;
            })
        );
        expect(isValidSolution).toBe(true);
    });
});
