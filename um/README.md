
# ACHTUNG!
**Diese README-Datei sollte für dieses Projekt angepasst werden. Sie wird nicht automatisch überschrieben!**

Dieses Projekt basiert auf [UM-Kickstarter](http://piwiki/x/5ytUBg).

Mehr Beispiele und Dokumentation siehe `Kickstarter.md`.

# Mit dem Kickstarter-UM arbeiten

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

# Linting und Code-Formatierung

In diesem Projekt wird ESlint zur Kontrolle der Code-Formatierung eingesetzt.

### ESlint-Konfig installieren

```
sudo npm i -g @pinuts/eslint-config-pinuts-um
```
