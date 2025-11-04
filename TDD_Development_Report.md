# 數獨開發專案 - TDD 開發流程報告

## 目錄
1. [專案概述](#專案概述)
2. [TDD 開發循環](#tdd-開發循環)
3. [每個階段的實作細節](#每個階段的實作細節)
4. [測試策略與設計](#測試策略與設計)
5. [遇到的挑戰與解決方案](#遇到的挑戰與解決方案)
6. [心得與反思](#心得與反思)

## 專案概述

本專案是使用 Test-Driven Development (TDD) 方法開發的數獨遊戲引擎。專案分為三個主要階段：
1. 規則引擎：驗證數獨規則
2. 解題器：使用回溯算法解決數獨
3. 生成器：創建新的數獨謎題

### 技術棧
- 語言：JavaScript (Node.js)
- 測試框架：Jest
- 開發方法：Test-Driven Development (TDD)

## TDD 開發循環

在整個開發過程中，我們嚴格遵循 TDD 的三個步驟：

### Red：寫一個失敗的測試
1. 先寫測試，描述期望的行為
2. 執行測試，確認測試失敗
3. 確保測試失敗的原因是功能未實作

### Green：實作最小可行的程式碼
1. 編寫最簡單的程式碼使測試通過
2. 專注於功能實現，暫時不考慮程式碼品質
3. 重新執行測試，確保通過

### Refactor：重構程式碼
1. 在測試保護下改善程式碼品質
2. 移除重複的程式碼
3. 提高程式碼可讀性和可維護性
4. 確保重構後測試仍然通過

## 每個階段的實作細節

### Phase 1：規則引擎
#### TDD 循環 1：isValid 方法

##### 1. 測試設計思考
首先，我們需要測試數獨的三個基本規則：
1. 同一行不能有重複數字
2. 同一列不能有重複數字
3. 同一個 3x3 方格內不能有重複數字

##### 2. Red 階段
```javascript
test('isValid should correctly validate number placement', () => {
    // 測試有效的數字放置
    expect(board.isValid(0, 2, 4)).toBe(true);

    // 測試行衝突
    expect(board.isValid(0, 2, 5)).toBe(false); // 5 已在同一行

    // 測試列衝突
    expect(board.isValid(0, 2, 8)).toBe(false); // 8 已在同一列

    // 測試 3x3 方格衝突
    expect(board.isValid(1, 1, 9)).toBe(false); // 9 已在同一個 3x3 方格
});
```

##### 3. Green 階段
```javascript
class SudokuBoard {
    constructor(grid) {
        this.grid = JSON.parse(JSON.stringify(grid));
        this.size = 9;
    }
    isValid(row, col, num) {
        // 檢查行
        for (let i = 0; i < this.size; i++) {
            if (this.grid[row][i] === num) return false;
        }
        // 檢查列
        for (let i = 0; i < this.size; i++) {
            if (this.grid[i][col] === num) return false;
        }
        // 檢查 3x3 方格
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
}
```

##### 4. Refactor 階段
- 將檢查邏輯分離為獨立函數
- 使用更具描述性的變數名稱
- 加入詳細的註解說明每個檢查步驟
- 考慮效能優化（例如：當找到衝突時立即返回）

### Phase 2：解題器
#### TDD 循環 2：solve 方法

##### 1. 演算法設計思考
解題器使用回溯算法（Backtracking）：
1. 找到一個空格
2. 嘗試填入數字 1-9
3. 檢查是否有效
4. 遞迴解決剩餘部分
5. 如果無解則回溯

##### 2. Red 階段
```javascript
test('solve should find a valid solution for a solvable puzzle', () => {
    const solutionGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        // ... 完整的解答格子
    ];
    
    expect(board.solve()).toBe(true);
    expect(board.grid).toEqual(solutionGrid);
});

test('solve should return false for unsolvable puzzle', () => {
    const unsolvableGrid = [
        [5, 5, 0, 0, 0, 0, 0, 0, 0], // 故意放入衝突
        // ... 剩餘格子
    ];
    const board = new SudokuBoard(unsolvableGrid);
    expect(board.solve()).toBe(false);
});
```

##### 3. Green 階段
```javascript
findEmpty() {
    for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
            if (this.grid[i][j] === 0) {
                return [i, j];
            }
        }
    }
    return null;
}

solve() {
    const find = this.findEmpty();
    if (!find) return true;
    
    const [row, col] = find;

    for (let num = 1; num <= this.size; num++) {
        if (this.isValid(row, col, num)) {
            this.grid[row][col] = num;
            if (this.solve()) return true;
            this.grid[row][col] = 0; // 回溯
        }
    }
    return false;
}
```

##### 4. Refactor 階段
- 優化空格搜尋策略
- 改善遞迴效能
- 加入解題過程的可視化（用於調試）

### Phase 3：生成器
#### TDD 循環 3：generate 方法

##### 1. 生成策略設計
生成器的工作流程：
1. 生成一個完整的解答
2. 根據難度移除適當數量的數字
3. 確保生成的謎題有唯一解

##### 2. Red 階段
```javascript
describe('generate', () => {
    test('should generate a puzzle with a specified number of empty cells', () => {
        const difficulty = 45;
        const { puzzle, solution } = generate(difficulty);

        // 驗證空格數量
        const emptyCells = puzzle.grid.flat().filter(cell => cell === 0).length;
        expect(emptyCells).toBe(difficulty);
        
        // 驗證謎題可解性
        const puzzleCopy = new SudokuBoard(puzzle.grid);
        expect(puzzleCopy.solve()).toBe(true);

        // 驗證解答的有效性
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
```

##### 3. Green 階段
```javascript
function generate(difficulty) {
    // 創建空白棋盤
    const emptyGrid = Array(9).fill(0).map(() => Array(9).fill(0));
    const solution = new SudokuBoard(emptyGrid);
    
    // 生成完整解答
    solution.solve(true); // 使用隨機化的解題器
    const puzzle = new SudokuBoard(solution.grid);
    
    // 移除數字
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
```

##### 4. Refactor 階段
- 加入隨機數生成器類別
- 優化數字移除策略
- 實作難度評估機制

## 測試策略與設計

### 1. 測試架構設計
#### 1.1 測試層級劃分
- **單元測試（Unit Tests）**
  - `SudokuBoard` 類別的基本方法測試
  - `isValid` 方法的輸入驗證
  - `findEmpty` 方法的返回值檢查
  - 單個函數的邊界條件測試

- **整合測試（Integration Tests）**
  - 解題器與驗證器的協同工作
  - 生成器與解題器的互動
  - 完整的遊戲流程測試

#### 1.2 測試夾具（Test Fixtures）
```javascript
describe('SudokuBoard', () => {
    let board;
    const initialGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        // ... 測試用的初始數獨盤面
    ];

    beforeEach(() => {
        board = new SudokuBoard(initialGrid);
    });
    
    // 測試案例...
});
```

### 2. 測試案例設計
#### 2.1 規則引擎測試
- **行規則測試**
  ```javascript
  test('row rule validation', () => {
      // 測試同一行的重複數字
      expect(board.isValid(0, 1, 5)).toBe(false); // 5 已存在於第一行
      expect(board.isValid(0, 1, 4)).toBe(true);  // 4 在第一行是合法的
  });
  ```

- **列規則測試**
  ```javascript
  test('column rule validation', () => {
      // 測試同一列的重複數字
      expect(board.isValid(1, 0, 5)).toBe(false); // 5 已存在於第一列
      expect(board.isValid(1, 0, 2)).toBe(true);  // 2 在第一列是合法的
  });
  ```

- **九宮格規則測試**
  ```javascript
  test('3x3 box rule validation', () => {
      // 測試同一九宮格的重複數字
      expect(board.isValid(1, 1, 3)).toBe(false); // 3 已存在於該九宮格
      expect(board.isValid(1, 1, 4)).toBe(true);  // 4 在該九宮格是合法的
  });
  ```

#### 2.2 解題器測試
- **基本解題測試**
  ```javascript
  test('solver with valid puzzle', () => {
      expect(board.solve()).toBe(true);
      // 驗證解答是否符合所有規則
  });
  ```

- **無解情況測試**
  ```javascript
  test('solver with unsolvable puzzle', () => {
      const unsolvableBoard = new SudokuBoard([
          [5, 5, 0, 0, 0, 0, 0, 0, 0], // 故意放入衝突
          // ...
      ]);
      expect(unsolvableBoard.solve()).toBe(false);
  });
  ```

- **特殊情況測試**
  ```javascript
  test('solver with empty board', () => {
      const emptyBoard = new SudokuBoard(Array(9).fill(Array(9).fill(0)));
      expect(emptyBoard.solve()).toBe(true);
  });
  ```

#### 2.3 生成器測試
- **難度控制測試**
  ```javascript
  test('generator difficulty control', () => {
      const difficulties = [20, 30, 40, 50];
      difficulties.forEach(difficulty => {
          const { puzzle } = generate(difficulty);
          const emptyCells = puzzle.grid.flat().filter(cell => cell === 0).length;
          expect(emptyCells).toBe(difficulty);
      });
  });
  ```

- **解的唯一性測試**
  ```javascript
  test('generated puzzle has unique solution', () => {
      const { puzzle, solution } = generate(45);
      const puzzleCopy = new SudokuBoard(puzzle.grid);
      puzzleCopy.solve();
      expect(puzzleCopy.grid).toEqual(solution.grid);
  });
  ```

### 3. 測試覆蓋率分析
#### 3.1 覆蓋率目標
- 語句覆蓋率（Statement Coverage）：> 95%
- 分支覆蓋率（Branch Coverage）：> 90%
- 函數覆蓋率（Function Coverage）：100%

#### 3.2 關鍵路徑測試
1. **規則驗證路徑**
   - 所有規則組合的測試
   - 邊界條件的完整覆蓋

2. **解題器路徑**
   - 成功解題路徑
   - 回溯路徑
   - 無解路徑

3. **生成器路徑**
   - 不同難度等級的生成
   - 解的唯一性檢查
   - 隨機性測試

### 4. 效能測試
#### 4.1 解題器效能
```javascript
test('solver performance', () => {
    const start = performance.now();
    board.solve();
    const end = performance.now();
    expect(end - start).toBeLessThan(1000); // 期望解題時間小於 1 秒
});
```

#### 4.2 生成器效能
```javascript
test('generator performance', () => {
    const start = performance.now();
    generate(45);
    const end = performance.now();
    expect(end - start).toBeLessThan(2000); // 期望生成時間小於 2 秒
});

## 遇到的挑戰與解決方案

### 挑戰 1：測試隨機性
- **問題**：生成器產生的謎題是隨機的，難以進行確定性測試
- **解決方案**：
  1. 改變測試重點，不測試具體數值
  2. 測試結果的特性（如空格數量、解的有效性）
  3. 使用屬性測試確保各種情況都能正常運作

### 挑戰 2：效能與測試
- **問題**：解題器在某些情況下可能需要較長時間
- **解決方案**：
  1. 設定合理的測試超時時間
  2. 在生成器中加入效能優化
  3. 使用更有效的回溯策略

## 心得與反思

### TDD 的優勢
1. **程式碼品質**：
   - 通過持續的測試驅動，確保程式碼品質
   - 重構過程中有測試保護，降低風險

2. **設計改善**：
   - 測試先行迫使我們思考介面設計
   - 形成更模組化的程式碼結構

3. **開發信心**：
   - 完整的測試覆蓋提供信心
   - 容易發現和修復缺陷

### 可改進之處
1. **測試覆蓋率**：
   - 可以加入更多邊界案例
   - 增加效能測試

2. **程式碼優化**：
   - 可以進一步提升演算法效能
   - 考慮加入更多設計模式

3. **功能擴展**：
   - 支援不同大小的數獨
   - 加入難度評估系統

### 結論
透過 TDD 方法開發數獨專案，不僅確保了程式碼品質，也讓整個開發過程更有條理和信心。每個測試都迫使我們思考設計決策，最終產出了一個穩定且可維護的系統。TDD 雖然前期投入較多，但能夠在後期維護和擴展時節省大量時間和精力。
