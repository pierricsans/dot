
from frontend.protos import level_pb2
from google.protobuf import json_format
from google.protobuf import text_format
from server import move_maker
from server import alternate_routes
from absl import app
from absl import flags
from absl import logging
import jinja2

_NAME = flags.DEFINE_string("name", None, "Your name.")

DUMMY_LEVEL = """
size: 5
rank: 0
moves: 3
num_aliens: 4
allowed_moves {
  direction: MOVE_DIRECTION_UP
}
allowed_moves {
  direction: MOVE_DIRECTION_DOWN
}
allowed_moves {
  direction: MOVE_DIRECTION_LEFT
}
allowed_moves {
  direction: MOVE_DIRECTION_RIGHT
}
grid {
  indigenous {
    trajectory {
    }
  }
}
"""

MOVES = [
  level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
  level_pb2.MoveDirection.MOVE_DIRECTION_DOWN,
  level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
  level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
  level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
]

def RenderTable() -> str:
   env = jinja2.Environment(
    loader=jinja2.PackageLoader("server"),
    autoescape=jinja2.select_autoescape()
   )
   template = env.get_template("table.html")
   level = text_format.Merge(DUMMY_LEVEL, level_pb2.Level())
   return template.render(level=level)


def GetInitialLevel() -> level_pb2.Level:
   level = text_format.Merge(DUMMY_LEVEL, level_pb2.Level())
   return json_format.MessageToJson(level)
   


def main(argv):
  del argv  # Unused.
  level = text_format.Merge(DUMMY_LEVEL, level_pb2.Level())
  logging.info(level)
  alternate_routes.GenerateInitialGrid(level, MOVES)
  logging.info(level)
  while level.grid.indigenous.trajectory.moves:
        move_maker.MoveGridToNextState(level.grid)
        logging.info(level.grid)


if __name__ == '__main__':
  app.run(main)