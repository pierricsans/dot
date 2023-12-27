
import attrs
from frontend.protos import level_pb2
from server import errors
import collections
from collections.abc import Sequence
import math
import random
import copy
import webcolors
from server import move_maker
from typing import Callable, Generator, Optional


_GOLDEN_ANGLE = 180 * (3 - math.sqrt(5))


def GetAllPeopleWithPotision(
        grid: level_pb2.Grid) -> Sequence[level_pb2.Person]:
    people = []
    for person in move_maker.GetAllPeople(grid):
        if HasPosition(person):
            people.append(person)
    return people


def GetOffset(
        size: int,
        moves: Sequence[level_pb2.Move],
        forwards: level_pb2.MoveDirection,
        backwards: level_pb2.MoveDirection) -> int:
    current_position = 0
    backwards_most = 0
    forwards_most = 0
    for move in moves:
        if move.direction == forwards:
            current_position += 1            
            forwards_most = max(current_position, forwards_most)
            backwards_most = min(current_position, backwards_most)
        elif move.direction == backwards:
            current_position -= 1            
            forwards_most = max(current_position, forwards_most)
            backwards_most = min(current_position, backwards_most)
    value = random.randrange(abs(backwards_most), (size - max(0, forwards_most)) + 1)
    return value


class Grid():

    def __init__(self, level: level_pb2.Grid):
        self.level = level
        self.grid = level.grid
        self.colors = self.GetColors()
        self.registered_trajectories = set()
        self.registered_positions = collections.defaultdict(set)
        self.RegisterTrajectory(self.grid.indigenous)

    def GenerateInitialGrid(self) -> None:
        self.grid.name = self.level.name
        self.grid.height = self.level.size
        self.grid.width = self.level.size
        self.GenerateInitialState(self.grid.indigenous)
        self.AddAliens()

    def AddAliens(self) -> None:
        """Generates initial position and moves for aliens."""
        CheckIndigenousHasMoves(self.level)
        for _ in range(self.level.num_aliens):
            alien = self.level.grid.aliens.add()
            alien.type = level_pb2.PersonType.PERSON_TYPE_ALIEN
            self.GenerateInitialState(alien, generate_random_moves=True)

    def GenerateInitialState(
            self,
            person: level_pb2.Person,
            generate_random_moves: bool = False):
        person.color = random.choice([color for color in self.colors])
        self.colors.remove(person.color)
        # Skip generating random moves if the person already has some.
        if generate_random_moves and not person.trajectory.moves:
            self.GenerateRandomTrajectory(person)
        self.GenerateInitialPosition(person)

    def GetColors(self):
        return set([
            f'hsl({i * _GOLDEN_ANGLE + 60}, 100%, 60%)'
            for i in range(self.level.num_aliens + 5)
        ])

    def GenerateRandomTrajectory(
            self,
            person: level_pb2.Person):
        trajectory = person.trajectory
        for _ in range(self.level.moves):
            trajectory.moves.add().CopyFrom(random.choice(self.level.allowed_moves))
        if not self.RegisterTrajectory(person):
            print('unlucky-trajectory')
            person.ClearField('trajectory')
            self.GenerateRandomTrajectory(person)

    def GenerateInitialPosition(self, person) -> None:
        person.position.x_offset = GetOffset(
            self.grid.width,
            [
                move for move in person.trajectory.moves
                if (move.direction == level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT
                or move.direction == level_pb2.MoveDirection.MOVE_DIRECTION_LEFT)
            ],
            backwards=level_pb2.MoveDirection.MOVE_DIRECTION_LEFT,
            forwards=level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
        )

        person.position.y_offset = GetOffset(
            self.grid.height,
            [
                move for move in person.trajectory.moves
                if (move.direction == level_pb2.MoveDirection.MOVE_DIRECTION_UP
                or move.direction == level_pb2.MoveDirection.MOVE_DIRECTION_DOWN)
            ],
            backwards=level_pb2.MoveDirection.MOVE_DIRECTION_DOWN,
            forwards=level_pb2.MoveDirection.MOVE_DIRECTION_UP,
        )
        if not self.RegisterPositions(person):
            print('unlucky-position')
            person.ClearField('position')
            self.GenerateInitialPosition(person)

    def RegisterTrajectory(self, person: level_pb2.Person) -> bool:
        values = tuple([move.direction for move in person.trajectory.moves])
        if values in self.registered_trajectories:
            return False
        self.registered_trajectories.add(values)
        return True

    def RegisterPositions(self, person) -> bool:
        initial_position = Position(
            person.position.x_offset, person.position.y_offset)
        if initial_position in self.registered_positions[0]:
            return False
        self.registered_positions[0].add(initial_position)
        next_move = 1
        current_position = initial_position
        for move in person.trajectory.moves:
            match move.direction:
                case level_pb2.MoveDirection.MOVE_DIRECTION_UP:
                    position = Position(current_position.x,
                                        current_position.y + 1)
                case level_pb2.MoveDirection.MOVE_DIRECTION_DOWN:
                    position = Position(current_position.x,
                                        current_position.y - 1)
                case level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT:
                    position = Position(
                        current_position.x + 1, current_position.y)
                case level_pb2.MoveDirection.MOVE_DIRECTION_LEFT:
                    position = Position(
                        current_position.x - 1, current_position.y)
                case _:
                    raise KeyError(f'Unknown direction: {move.direction:}')
            if position in self.registered_positions[next_move]:
                return False
            self.registered_positions[next_move].add(position)
            next_move += 1
            current_position = position

        return True


@attrs.define(frozen=True)
class Position:
    x: int | None = None
    y: int | None = None


def GetRandomColor(i: int) -> Generator[str, None, None]:
    return f'hsl({i * _GOLDEN_ANGLE + 60}, 100%, 60%)'


def CheckIndigenousHasMoves(level: level_pb2.Level) -> None:
    if not level.grid.indigenous:
        raise errors.InvalidGridException()
    if len(level.grid.indigenous.trajectory.moves) != level.moves:
        raise errors.InvalidGridException


def HasPosition(person: level_pb2.Person) -> bool:
    return person.HasField('position')
