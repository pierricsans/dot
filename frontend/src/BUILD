load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

package(default_visibility=[
    "//frontend:__pkg__",
])

ts_project(
    name="theme",
    srcs=["theme.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
    deps=[
        "//frontend/protos:level_ts_proto",
        "//:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name="bead",
    srcs=["bead.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
    deps=[
        ":constants",
        ":util",
        "//frontend/protos:level_ts_proto",
        "//:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name="selector",
    srcs=["selector.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
    deps=[
        ":util",
        "//frontend/protos:level_ts_proto",
        "//:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name="constants",
    srcs=["constants.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
)

ts_project(
    name="countdown",
    srcs=["countdown.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
    deps=[
        ":constants",
        ":util",
        "//frontend/protos:level_ts_proto",
        "//:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name="scoreboard",
    srcs=["scoreboard.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
    deps=[
        ":constants",
        ":util",
        "//frontend/protos:level_ts_proto",
        "//:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name="util",
    srcs=["util.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
)

ts_project(
    name="grid",
    srcs=["grid.ts"],
    declaration=True,
    transpiler="tsc",
    tsconfig="//frontend:tsconfig",
    deps=[
        ":util",
        ":bead",
        ":countdown",
        "//frontend/protos:level_ts_proto",
        "//:node_modules/@bufbuild/protobuf",
    ]
)