# UM-Kickstarter



## Mit dem Kickstarter-UM arbeiten

UM installieren und Konfigurationsdateien gemäß `build.gradle` kopieren bzw. verlinken:
```bash
gradle setup
```

UM starten:
```bash
gradle run
```

"Deployable" = ZIP-File für Umgebung `${ENVIRONMENT}` bauen:
```bash
gradle dist -Penv=${ENVIRONMENT}
```

Docker-Image für Umgebung `${ENVIRONMENT}` bauen:
```bash
# gradle dockerize
gradle dockerimage -Penv=${ENVIRONMENT}
```

UM inkl. Datenbank löschen:
```bash
gradle destroy
```

Datenbank-UI im Browser öffnen:
```bash
gradle h2console
```

Updaten der Kickstarter-Skripte (`.umstarter.gradle`):
```bash
gradle update
```

## UM-Plugins aus Mavenrepo einbinden

UM-Plugins aus unserem Mavenrepo ([Releases](http://mavenrepo/#browse~pinuts-releases/de.pinuts.cmsbs)
und [Snapshots](http://mavenrepo/#browse~pinuts-snapshots/de.pinuts.cmsbs))
können in `build.gradle` in den
_dependencies_ angefordert werden. Sie werden dann automatisch nach `UM/cmsbs-conf/cse/plugins/`
ausgepackt.
```groovy
dependencies {
    runtime('de.pinuts.cmsbs:UM:7.32.0')
    runtime('de.pinuts.cmsbs:CseConsole:7.10.4')
    runtime('de.pinuts.cmsbs:Templating:master-SNAPSHOT')
    runtime('de.pinuts.cmsbs:Solr:0.2.9')
}
```

## UM-Plugins direkt aus Git einbinden

Wenn bestimmte Plugins nicht aus dem Mavenrepo, sondern direkt aus dem Git
geholt werden sollen, geht das so:
```groovy
// UM Plugins aus dem GIT holen und in pinuts.um.pluginsDir verlinken:
pinuts.gitPlugins = [
    [ clone: 'git@git:cmsbs-plugins/auth2.git' ],
    [ clone: 'git@git:cmsbs/libplugin.git', branch: 'hbsauthpoc'],
]

setup.finalizedBy gitplugins // automatisch beim setup miterledigen
```

## Eigenes UM-Plugin erstellen

Eigene Plugins gehören nach `cmsbs-conf/cse/plugins/`. Sie werden per Symlink
im _setup.doLast_-Block in den lokalen UM eingebunden, z.B.:
```groovy
setup.doLast {
    ln('cmsbs-conf/cse/plugins/de.pinuts.myumaddon', pinuts.um.pluginsDir)
}
```
Beispiele und API-Dokumentation gibt es hier: [UM-API-Doc](http://bob.intra.pinuts.de/~build/api-cse/)

## "Deployables" bauen

Umgebungsspezifische Konfiguration kommt nach `env/${ENVIRONMENT}/cmsbs-conf/` und die üblichen
Unterverzeichnisse. `${ENVIRONMENT}` kann z.B. "devel" (Default), "stage", "prod" oder
sonst irgendein möglichst sprechender Name für eine bestimmte Zielumgebung sein.

Für die Umgebung "prod" kann dann wie folgt ein ZIP-File gebaut werden:

```bash
gradle dist -Penv=prod
```

Das Ergebnis landet unter `build/${PROJECT_NAME}-prod.zip`.

In diesem ZIP-File landet automatisch etwa Folgendes:
* `cmsbs-conf/**`
* `env/${ENVIRONMENT}/**`
* `UM/cmsbs-conf/cse/plugins/**`

Weitere Dateien kann man in einem _dist.doLast_-Block ins ZIP-File aufnehmen. Dazu
eignet sich [_ant.zip_](https://ant.apache.org/manual/Tasks/zip.html) besonders gut, z.B.
```groovy
dist.doLast {
    // REST-Proxy:
    ant.zip(destfile: pinuts.distFilename, update: true) {
        zipfileset(dir: 'UM/web-integration', includes: 'cmsbs-restproxy.war', fullpath: 'cmsbs-work/webapps/p.war')
    }
    ant.zip(destfile: pinuts.distFilename, update: true) {
        zipfileset(dir: 'rest-proxy', includes: 'cmsbs-restproxy.properties')
    }

    // JAR-Files aus `cmsbs/WEB-INF/lib/`:
    ant.zip(destfile: pinuts.distFilename, update: true) {
        zipfileset(dir: '.', includes: 'cmsbs/**/*.jar')
    }

    // Weitere JAR-Files aus anderem Verzeichnis `my-libs/`:
    ant.zip(destfile: pinuts.distFilename, update: true) {
        zipfileset(dir: 'my-libs', includes: '**/*.jar', prefix: 'cmsbs/WEB-INF/lib')
    }
}
```

### Versionsnummer des Deployables
Die Versionsnummer des Deployables kann entweder als Konstante festgelegt
```groovy
pinuts.version = '3.1.4'
```
oder aus *dem* Plugindesriptor ausgelesen werden:
```groovy
pinuts.version = getVersionFromPluginDescriptor('the_plugin/plugin.desc.json')
```
`the_plugin` sollte ein Symlink auf *den* Plugin-Ordner sein, der auch mit ins Git gehört:
```bash
ln -s cmsbs-conf/cse/plugins/de.pinuts.myumaddon the_plugin
```

## Buildskript aktualisieren

Alle UM-spezifischen Gradle-Tasks sind in `.umstarter.gradle` implementiert.
Diese Datei kann wie folgt auf den neusten Stand gebracht werden:
```bash
gradle updateBuildScript
```

## Docker-Image bauen

Soll der UM in einer Dockerumgebung ausgeführt werden, müssen zunächst die dazu
erforderlichen Dateien (`Dockerfile`, `.docker-entrypoint.sh`,
`.dockerignore`, `.um.varfile`) heruntergeladen bzw. generiert werden:
```bash
gradle dockerize
```
Diese Dateien gehören ins git und können -- falls erforderlich -- angepasst
werden.

Nun kann ein Dockerimage gebaut werden -- z.B. für die _prod_-Umgebung:
```bash
gradle dockerimage -Penv=prod
```
Das _Tag_ des erzeugten Images setzt sich dabei zusammen aus dem Wert der Variablen
`pinuts.docker.tag` (Fallback auf `pinuts.projectName` in lowercase) und dem Namen der Umgebung, z.B. also `myproject:prod`.

Von diesem Image kann man dann einen Container starten, z.B.:
```bash
docker run --rm -p 8080:8080 myproject:prod
```

## HTML-Dummy aus Fremd-Git einbinden
To be documented...
```groovy
// HTML Dummy aus GIT holen und in pinuts.um.webappsRootDir verlinken:
pinuts.gitHtml.clone = 'git@git:irgendein/projekt.git'
setup.finalizedBy githtml // automatisch beim setup miterledigen
```

## Testing
To be documented...
```groovy
test.dependsOn << testDriver_umci // TestDriver automatisch anstarten
```

## Linting und Code-Formatierung

In diesem Projekt wird ESlint zur Kontrolle der Code-Formatierung eingesetzt.

### ESlint-Konfig installieren

```
sudo npm i -g @pinuts/eslint-config-pinuts-um
```

### ESlint-Konfig erstellen

Nachdem der UM einmal gestartet wurde, wird eine passende ESlint-Konfig erstellt, die mit ins git gehört: `cmsbs-conf/.eslintrc.js`
```
gradle vscode
```
