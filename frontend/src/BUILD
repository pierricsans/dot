load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

package(default_visibility = [
    "//frontend:__pkg__",
])

ts_project(
    name = "theme",
    srcs = ["theme.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        "//:node_modules/@bufbuild/protobuf",
        "//frontend/protos:level_ts_proto",
    ],
)

ts_project(
    name = "bead",
    srcs = ["bead.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        ":constants",
        ":util",
        "//:node_modules/@bufbuild/protobuf",
        "//frontend/protos:level_ts_proto",
    ],
)

ts_project(
    name = "selector",
    srcs = ["selector.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        ":constants",
        ":util",
        "//:node_modules/@bufbuild/protobuf",
        "//frontend/protos:level_ts_proto",
    ],
)

ts_project(
    name = "constants",
    srcs = ["constants.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
)

ts_project(
    name = "countdown",
    srcs = ["countdown.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        ":constants",
        ":util",
        "//:node_modules/@bufbuild/protobuf",
        "//frontend/protos:level_ts_proto",
    ],
)

ts_project(
    name = "scoreboard",
    srcs = ["scoreboard.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        ":constants",
        ":util",
        "//:node_modules/@bufbuild/protobuf",
        "//frontend/protos:level_ts_proto",
    ],
)

ts_project(
    name = "util",
    srcs = ["util.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
)

ts_project(
    name = "grid",
    srcs = ["grid.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        ":bead",
        ":countdown",
        ":util",
        "//:node_modules/@bufbuild/protobuf",
        "//frontend/protos:level_ts_proto",
    ],
)

ts_project(
    name = "levels",
    srcs = ["levels.ts"],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        "//:node_modules/@bufbuild/protobuf",
        "//frontend/protos:level_ts_proto",
    ],
)
