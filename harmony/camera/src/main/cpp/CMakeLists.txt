# 设置 Codegen 生成目录，指定 generated 目录路径
set(rtn_camera_generated_dir "${CMAKE_CURRENT_SOURCE_DIR}/generated")

# 使用 GLOB_RECURSE 递归地查找所有在 generated 目录下的 .cpp 文件，并将其存储到变量 rtn_camera_generated_SRC 中
file(GLOB_RECURSE rtn_camera_generated_SRC "${rtn_camera_generated_dir}/**/*.cpp")

# 查找当前目录下的所有 .cpp 文件，并将其存储到变量 rtn_camera_SRC 中
# CONFIGURE_DEPENDS 表示如果这些文件被修改，CMake 会重新配置
file(GLOB rtn_camera_SRC CONFIGURE_DEPENDS *.cpp)

# 创建一个共享库 rtn_camera，包含两部分：rtn_camera_SRC 和 rtn_camera_generated_SRC
add_library(rtn_camera SHARED ${rtn_camera_SRC} ${rtn_camera_generated_SRC})

# 为目标库 rtn_camera 设置包含路径，这些路径会包含当前源目录和 Codegen 生成文件所在的目录
target_include_directories(rtn_camera PUBLIC ${CMAKE_CURRENT_SOURCE_DIR} ${rtn_camera_generated_dir})

# 将库 rtn_camera 链接到 rnoh sdk，意味着 rtn_camera 使用 rnoh sdk 中的功能
target_link_libraries(rtn_camera PUBLIC rnoh)