# 1. Build Stage  Maven baut dein Jar
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Maven Projektdateien in den Container kopieren
COPY pom.xml .
COPY src ./src

# Jar bauen  Tests überspringen wir im Docker Build
RUN mvn clean package -DskipTests

# 2. Runtime Stage  schlankes Image nur mit JDK und Jar
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Fertiges Jar aus der Build Stage holen
COPY --from=build /app/target/*.jar /app/app.jar

# Ordner für SQLite Datenbank  passt zu deinem Pfad jdbc:sqlite:/app/data/app.db
RUN mkdir -p /app/data

# Dein Backend läuft auf 8443 mit SSL
EXPOSE 8443

CMD ["java", "-jar", "/app/app.jar"]
