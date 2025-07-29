cmake_minimum_required(VERSION 3.15)
project(CroissantAPI VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

# Create library target
add_library(croissant_api 
    croissant_api_new.cpp
    croissant_api_new.hpp
)

# Set target properties
target_include_directories(croissant_api PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<INSTALL_INTERFACE:include>
)

# Link libraries
target_link_libraries(croissant_api PUBLIC 
    nlohmann_json::nlohmann_json 
    cpr::cpr
)

# Create example executable
add_executable(croissant_example example_usage.cpp)
target_link_libraries(croissant_example PRIVATE croissant_api)

# Compiler-specific options
if(MSVC)
    target_compile_options(croissant_api PRIVATE /W4)
else()
    target_compile_options(croissant_api PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Installation rules
include(GNUInstallDirs)

install(TARGETS croissant_api
    EXPORT CroissantAPITargets
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

install(FILES croissant_api_new.hpp
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)

install(EXPORT CroissantAPITargets
    FILE CroissantAPITargets.cmake
    NAMESPACE CroissantAPI::
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/CroissantAPI
)

# Create config file
include(CMakePackageConfigHelpers)

configure_package_config_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/CroissantAPIConfig.cmake.in"
    "${CMAKE_CURRENT_BINARY_DIR}/CroissantAPIConfig.cmake"
    INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/CroissantAPI
)

write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/CroissantAPIConfigVersion.cmake"
    VERSION ${PROJECT_VERSION}
    COMPATIBILITY AnyNewerVersion
)

install(FILES
    "${CMAKE_CURRENT_BINARY_DIR}/CroissantAPIConfig.cmake"
    "${CMAKE_CURRENT_BINARY_DIR}/CroissantAPIConfigVersion.cmake"
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/CroissantAPI
)

# Export targets for build tree
export(EXPORT CroissantAPITargets
    FILE "${CMAKE_CURRENT_BINARY_DIR}/CroissantAPITargets.cmake"
    NAMESPACE CroissantAPI::
)

# Package configuration
set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
