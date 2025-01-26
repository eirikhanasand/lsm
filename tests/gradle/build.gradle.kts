plugins {
    id("com.jfrog.artifactory") version "5.+"
    kotlin("jvm") version "1.9.22"
}

buildscript {
    repositories {
        maven {
            url = uri("https://" + System.getenv("JFROG_ID") + "/java")
            credentials {
                username = System.getenv("JFROG_USERNAME")
                password = System.getenv("JFROG_TOKEN")
            }
        }
    }
    dependencies {
        classpath("org.jfrog.buildinfo:build-info-extractor-gradle:4+")
    }
}

allprojects {
    repositories {
        maven {
            url = uri("https://" + System.getenv("JFROG_ID") + "/java")
            credentials {
                username = System.getenv("JFROG_USERNAME")
                password = System.getenv("JFROG_TOKEN")
            }
        }
    }

    apply(plugin = "com.jfrog.artifactory")
}

artifactory {
    setContextUrl("https://" + System.getenv("JFROG_ID"))

    publish {
        repository {
            repoKey = "java"
            username = System.getenv("JFROG_USERNAME")
            password = System.getenv("JFROG_TOKEN")
        }
    }
}

val dependencyFromArgs: String? = project.findProperty("dependency") as String?

// Dynamically add dependency during configuration phase
tasks.register("addDependencyAndBuild") {
    doFirst {
        if (dependencyFromArgs != null) {
            project.dependencies.add("implementation", dependencyFromArgs)

            configurations.compileClasspath.resolvedConfiguration.firstLevelModuleDependencies.forEach {
                println("Resolved dependency: ${it.moduleGroup}:${it.moduleName}:${it.moduleVersion}")
            }

            println("Dependency added: $dependencyFromArgs")
        }
    }

    doLast {
        tasks.getByName("build").dependsOn(this)
    }
}

