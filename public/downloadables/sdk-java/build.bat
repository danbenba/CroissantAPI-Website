@echo off
REM Script de build pour CroissantAPI Java Client (Windows)
REM Ce script automatise la compilation et l'exécution de l'exemple

echo === Build CroissantAPI Java Client ===

REM Vérifier la présence de Java
java -version >nul 2>&1
if errorlevel 1 (
    echo Erreur: Java n'est pas installé ou n'est pas dans le PATH
    exit /b 1
)

javac -version >nul 2>&1
if errorlevel 1 (
    echo Erreur: javac n'est pas installé ou n'est pas dans le PATH
    exit /b 1
)

REM Créer les répertoires de build
if not exist build mkdir build
if not exist lib mkdir lib

REM Télécharger Gson si nécessaire
set GSON_JAR=lib\gson-2.10.1.jar
if not exist "%GSON_JAR%" (
    echo Téléchargement de Gson...
    echo Veuillez télécharger manuellement gson-2.10.1.jar dans le dossier lib\
    echo URL: https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar
    pause
)

REM Compiler les classes Java
echo Compilation des classes Java...
javac -cp "%GSON_JAR%" -d build *.java

if errorlevel 1 (
    echo Erreur de compilation
    exit /b 1
)

echo Compilation réussie!

REM Exécuter l'exemple si demandé
if "%1"=="run" (
    echo Exécution de l'exemple...
    java -cp "build;%GSON_JAR%" CroissantAPIExample
)

REM Exécuter les tests si demandé
if "%1"=="test" (
    echo Exécution des tests...
    
    set JUNIT_JAR=lib\junit-4.13.2.jar
    set HAMCREST_JAR=lib\hamcrest-core-1.3.jar
    
    if not exist "%JUNIT_JAR%" (
        echo Veuillez télécharger junit-4.13.2.jar dans le dossier lib\
        echo URL: https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar
    )
    
    if not exist "%HAMCREST_JAR%" (
        echo Veuillez télécharger hamcrest-core-1.3.jar dans le dossier lib\
        echo URL: https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar
    )
    
    if exist "%JUNIT_JAR%" if exist "%HAMCREST_JAR%" (
        java -cp "build;%GSON_JAR%;%JUNIT_JAR%;%HAMCREST_JAR%" org.junit.runner.JUnitCore CroissantAPITest
    )
)

echo Build terminé!

REM Instructions d'utilisation
echo.
echo Usage:
echo   build.bat          - Compile seulement
echo   build.bat run      - Compile et exécute l'exemple
echo   build.bat test     - Compile et exécute les tests

pause
