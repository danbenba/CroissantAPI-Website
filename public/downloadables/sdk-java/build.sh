#!/bin/bash

# Script de build pour CroissantAPI Java Client
# Ce script automatise la compilation et l'exécution de l'exemple

echo "=== Build CroissantAPI Java Client ==="

# Vérifier la présence de Java
if ! command -v java &> /dev/null; then
    echo "Erreur: Java n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

if ! command -v javac &> /dev/null; then
    echo "Erreur: javac n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

# Créer le répertoire de build
mkdir -p build
mkdir -p lib

# Télécharger Gson si nécessaire
GSON_JAR="lib/gson-2.10.1.jar"
if [ ! -f "$GSON_JAR" ]; then
    echo "Téléchargement de Gson..."
    curl -L "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar" -o "$GSON_JAR"
    if [ $? -ne 0 ]; then
        echo "Erreur: Impossible de télécharger Gson"
        echo "Veuillez télécharger manuellement gson-2.10.1.jar dans le dossier lib/"
        exit 1
    fi
fi

# Compiler les classes Java
echo "Compilation des classes Java..."
javac -cp "$GSON_JAR" -d build *.java

if [ $? -ne 0 ]; then
    echo "Erreur de compilation"
    exit 1
fi

echo "Compilation réussie!"

# Exécuter l'exemple si demandé
if [ "$1" = "run" ]; then
    echo "Exécution de l'exemple..."
    java -cp "build:$GSON_JAR" CroissantAPIExample
fi

# Exécuter les tests si demandé
if [ "$1" = "test" ]; then
    echo "Exécution des tests..."
    
    # Télécharger JUnit si nécessaire
    JUNIT_JAR="lib/junit-4.13.2.jar"
    HAMCREST_JAR="lib/hamcrest-core-1.3.jar"
    
    if [ ! -f "$JUNIT_JAR" ]; then
        echo "Téléchargement de JUnit..."
        curl -L "https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar" -o "$JUNIT_JAR"
    fi
    
    if [ ! -f "$HAMCREST_JAR" ]; then
        echo "Téléchargement de Hamcrest..."
        curl -L "https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar" -o "$HAMCREST_JAR"
    fi
    
    java -cp "build:$GSON_JAR:$JUNIT_JAR:$HAMCREST_JAR" org.junit.runner.JUnitCore CroissantAPITest
fi

echo "Build terminé!"

# Instructions d'utilisation
echo ""
echo "Usage:"
echo "  ./build.sh          - Compile seulement"
echo "  ./build.sh run       - Compile et exécute l'exemple"
echo "  ./build.sh test      - Compile et exécute les tests"
