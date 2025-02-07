ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.16"

val jfrogHost = sys.env.get("JFROG_ID").get + ".jfrog.io"
val jfrogUser = sys.env.get("JFROG_USERNAME").get
val jfrogToken = sys.env.get("JFROG_ACCESS_TOKEN").get

// Nuclear option: Completely disable all default resolution
ThisBuild / resolvers := Seq(
  "Artifactory" at "https://" + jfrogHost + "/artifactory/maven/"
)

ThisBuild / csrResolvers := resolvers.value
ThisBuild / updateOptions := updateOptions.value
  .withLatestSnapshots(false)
  .withCachedResolution(false)

ThisBuild / ivyPaths := {
  val base = (ThisBuild / baseDirectory).value
  IvyPaths(base, Some(base / "ivy-cache"))
}

externalResolvers :=
  Resolver.combineDefaultResolvers(resolvers.value.toVector, mavenCentral = false)

lazy val root = (project in file("."))
  .settings(
    name := "untitled",
    credentials += Credentials(
  "Artifactory Realm",
  jfrogHost,
  jfrogUser,
  jfrogToken
))

val extraDependency = sys.env.get("DEPENDENCY")

libraryDependencies ++= extraDependency.map { dep =>
  val parts = dep.split(":")
  if (parts.length == 3) {
    Some(parts(0) % parts(1) % parts(2))
  } else {
    None
  }
}.flatten.toSeq


lazy val verifyResolution = taskKey[Unit]("Verify strict Artifactory resolution")
verifyResolution := {
  val log = streams.value.log
  val rs = fullResolvers.value

  if(rs.size != 1) throw new Exception(s"Found ${rs.size} resolvers:\n${rs.mkString("\n")}")

  val artiUrl = rs.head.name
  if(!artiUrl.startsWith("https://trials9g9m1.jfrog.io")) {
    throw new Exception(s"Unexpected resolver URL: $artiUrl")
  }
  log.success("Artifactory is the only resolver configured")
}