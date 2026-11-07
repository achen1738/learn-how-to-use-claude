class Board:
    def __init__(self, rows: int = 6, columns: int = 7):
        self.board = [[0 for _ in range(columns)] for _ in range(rows)]
        self.ROW_LENGTH = rows
        self.COLUMN_LENGTH = columns
        self.TOTAL_SLOTS = self.ROW_LENGTH * self.COLUMN_LENGTH
        self.FILLED_SLOTS = 0
        # Directions are [row step, column step]
        self.UP_RIGHT_DIAG = [1, 1]
        self.UP_LEFT_DIAG = [-1, 1]
        self.HORIZONTAL = [0, 1]
        self.VERTICAL = [1, 0]

        
    def place_disc(self, player, column):
        if not self.__in_bounds(0, column):
            return -1
              
        player_symbol = player.get_symbol()
        for row in range(self.ROW_LENGTH):
            if self.board[row][column] == 0:
                self.board[row][column] = player_symbol
                self.FILLED_SLOTS += 1
                return row

        return -1

    def is_draw(self):
        return self.FILLED_SLOTS == self.TOTAL_SLOTS
    
    def check_win(self, player, row, column):
        symbol = player.get_symbol()
        return (self.__check_row_win(symbol, row) or
            self.__check_column_win(symbol, column) or
            self.__check_up_left_diag(symbol, row, column) or
            self.__check_up_right_diag(symbol, row, column))

    def __check_winning_vector(self, symbol, row, column, direction):
        continuous_symbols = 0
        currRow = row
        currCol = column
        while self.__in_bounds(currRow, currCol):
            if self.board[currRow][currCol] == symbol:
                continuous_symbols += 1
                if continuous_symbols == 4:
                    return True
            else:
                continuous_symbols = 0
            currRow += direction[0]
            currCol += direction[1]
        return False

    def __in_bounds(self, row, column):
        return 0 <= row < self.ROW_LENGTH and 0 <= column < self.COLUMN_LENGTH

    def __check_up_left_diag(self, symbol, row, column):
        steps = min(self.ROW_LENGTH - 1 - row, column)
        currRow = row + steps
        currCol = column - steps
        return self.__check_winning_vector(symbol, currRow, currCol, self.UP_LEFT_DIAG)

    def __check_up_right_diag(self, symbol, row, column):
        currRow = row - min(row, column)
        currCol = column - min(row, column)
        return self.__check_winning_vector(symbol, currRow, currCol, self.UP_RIGHT_DIAG)

    def __check_row_win(self, symbol, row):
        return self.__check_winning_vector(symbol, row, 0, self.HORIZONTAL)

    def __check_column_win(self, symbol, column):
        return self.__check_winning_vector(symbol, 0, column, self.VERTICAL)