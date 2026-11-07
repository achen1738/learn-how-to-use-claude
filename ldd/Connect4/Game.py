from Board import Board
from enum import Enum
from Player import Player
from typing import Optional

class SYMBOL(Enum):
    RED = "RED"
    BLUE = "BLUE"

class GameState(Enum):
    WIN = "WIN"
    IN_PROGRESS = "IN_PROGRESS"
    DRAW = "DRAW"

class Game:
    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.current_player = player1
        self.board = Board()
        self.game_state = GameState.IN_PROGRESS
        self.winner = None

    def make_move(self, player, column):
        if (self.current_player != player):
            return False
        if (self.game_state != GameState.IN_PROGRESS):
            return False
  
        
        row = self.board.place_disc(self.current_player, column)
        if row == -1:
            return False

        if self.board.check_win(player, row, column):
            self.game_state = GameState.WIN      
            self.winner = player
        elif self.board.is_draw():
            self.game_state = GameState.DRAW
        else:
            self.current_player = self.player2 if self.current_player is self.player1 else self.player1
        return True

    def get_game_state(self) -> GameState:
        return self.game_state

    def get_winner(self) -> Optional[Player]:
        return self.winner

    def get_board(self) -> Board:
        return self.board
