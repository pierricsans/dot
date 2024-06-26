load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_webpack//webpack:defs.bzl", "webpack_bundle")

ts_project(
    name = "main",
    srcs = [
        "main.ts",
        "static/style.css",
    ],
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        "//:node_modules/@bufbuild/protobuf",
        "//:node_modules/@types/node",
        "//frontend/protos:level_ts_proto",
        "//frontend/src:countdown",
        "//frontend/src:grid",
        "//frontend/src:level_game",
        "//frontend/src:scoreboard",
        "//frontend/src:selector",
        "//frontend/src:storer",
        "//frontend/src:util",
        "//frontend/src:validation",
    ],
)

ts_project(
    name = "emojis",
    srcs = [
        "emojis.ts",
        "emojis/custom.d.ts",
    ] + glob(["emojis/*.png"]),
    declaration = True,
    declaration_map = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [],
    visibility = [
        "//frontend/src:__pkg__"
    ]
)

webpack_bundle(
    name = "bundle",
    srcs = [
        "static/favicon.png",
        "static/index.html",
        "static/style.css",
        ":main",
    ] + glob(["emojis/*.png"]),
    entry_point = ":main",
    node_modules = "//:node_modules",
    output_dir = True,
    webpack_config = "webpack_config.js",
    deps = [
        "//:node_modules/babel-loader",
        "//:node_modules/clean-webpack-plugin",
        "//:node_modules/css-loader",
        "//:node_modules/css-minimizer-webpack-plugin",
        "//:node_modules/favicons-webpack-plugin",
        "//:node_modules/file-loader",
        "//:node_modules/html-webpack-plugin",
        "//:node_modules/mini-css-extract-plugin",
        "//:node_modules/terser-webpack-plugin",
        "//:node_modules/webpack-merge",
    ],
)
