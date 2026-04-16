// 🔹 Plugin de Google Services (Firebase)
// No se aplica aquí; solo se declara para que el módulo "app" pueda usarlo.
plugins {
    id("com.google.gms.google-services") version "4.4.2" apply false
}

// 🔹 Repositorios globales (para todas las dependencias)
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// 🔹 Ajuste de directorios de compilación (estructura recomendada por Flutter)
val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
    project.evaluationDependsOn(":app")
}

// 🔹 Tarea para limpiar el proyecto
tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
