# Testbericht · v0.5.2

Abschlusslauf am 19.10.2026: **122 Assertions bestanden, zwölf Screenshots, keine JavaScript-Browserfehler**. Ausgeführt mit `npm test` über den lokalen HTTP-Testserver auf 127.0.0.1. Dieselbe Chromium-/Playwright-Umgebung wie im untenstehenden Ausgangsbericht.

Alle bisherigen Berechnungs- und UI-Prüfungen wurden erneut erfolgreich ausgeführt. Zusätzlich geprüft: SVG-Füllung/Kontur und Text in beiden Farbmodi, PNG-Abmessungen 192/512/180 Pixel, Favicon-Verknüpfung und Apple-Icon ohne Netzwerk. Die aktualisierten 320-Pixel-Screenshots beider Modi sowie das 192-Pixel-Icon wurden visuell kontrolliert: kg-Symbol erkennbar, Kopfzeile ohne Überlagerungen. Die zwölf Dateien in `screenshots/` zeigen jetzt 0.5.2; die vorherigen Aufnahmen sind im Git-Tag v0.5.1 erhalten.

Echte Launcher-Installation und Icon-Aktualisierung auf iPhone/Windows wurden weiterhin nicht auf Hardware geprüft. Alle unten genannten Geräte-/Barrierefreiheitsgrenzen gelten fort.

---

# Testbericht · v0.5.1

Ausgeführt am 19.10.2026 in dieser Entwicklungsumgebung. Letzter vollständiger Lauf: `npm test` nach `npm ci` mit der eingecheckten Lockdatei.

```text
PASS: 111 assertions; 12 screenshots; no browser errors.
```

Umgebung: Node.js 24.19.0, Playwright 1.56.1, Chromium 154.0.8037.57, Debian Linux. Browserzugriff ausschließlich über einen vom Test gestarteten lokalen HTTP-Server auf 127.0.0.1 mit dynamischem Port. Die benötigte Netzwerkfreigabe der Entwicklungsumgebung war beim Test aktiv. Kein externer Webdienst erforderlich.

## Tatsächlich durchgeführte automatisierte Prüfungen

| Bereich | Ergebnis / Abdeckung |
|---|---|
| Referenzberechnung | Bestanden: 500 g / 20 × 60 mm Stahl → 53,078556… mm; weitere Referenzen für alle drei Materialien |
| Gewichtseinheiten | Bestanden: mg, g, kg, t; physikalische Masse bleibt beim Wechsel erhalten |
| Längeneinheiten | Bestanden: mm, cm, m für Dicke/Breite/Nahtlänge/Nahtmaß; Hauptausgabe sowie gespeicherte zweite Ausgabe |
| Dezimaleingaben | Bestanden: Komma, Punkt, Rand-Leerzeichen, wissenschaftliche Schreibweise |
| Unzulässige Eingaben | Bestanden: leer, null, negativ, Text, gemischte Trenner, innere Leerzeichen, Infinity, numerischer Über-/Unterlauf |
| Sehr kleine/große Werte | Bestanden: kein positiver Null-Erfolgswert; extreme Nahtwerte ohne Infinity in der Nahtanzeige |
| Nahtmodell | Bestanden: Kehlnaht 6,28 g; Quadratmodell 12,56 g bei 100 mm × 4 mm und Stahldichte; korrekte Subtraktion |
| Nahtaktivierung | Bestanden: Aktivieren/Deaktivieren, Null-Nahtlänge, ungültige Nahtmaße, Nahtmasse größer Zielmasse |
| Elektroden | Bestanden: gespeicherte Sorte, Durchmesser und Stablänge nach Reload; temporäre Auswahl bleibt beim Farbwechsel erhalten; Standard 2,0 mm nach Reset |
| Einstellungen | Bestanden: echte Öffnen/Fertig/Reset-Schaltflächen; Umrechnung beim Reset; Werkstoff und Einheiten nach Reload |
| Farbmodus | Bestanden: Schalten und Wiederherstellung nach Reload; Screenshots beider Modi |
| Ergebnisansicht | Bestanden: Miniatur öffnet integrierte Maßansicht, Einklappen stellt kompakte Ansicht wieder her |
| Zeichnung | Bestanden: Miniatur mittig und im SVG bei normalen und extremen Proportionen; Maßbeschriftungen innerhalb der viewBox |
| Layout | Bestanden: kein horizontaler Dokumentüberlauf bei 320, 375, 390 und 1280 CSS-Pixeln; auch Einstellungen bei 320 px |
| Kopieren / Textsicherheit | Bestanden: Clipboard-Text enthält Version/Ergebnis; HTML-artiger eigener Elektrodenname erzeugt kein HTML-Element |
| Speicherausfälle | Bestanden: ungültiges JSON, null, unbekannte Einstellungswerte und verweigerter localStorage ohne App-Abbruch |
| Offlinebetrieb | Bestanden: Service Worker übernimmt Seite; Neuladen ohne Netzwerk liefert funktionsfähige App; fremder Cache bleibt bestehen |
| Laufzeit | Keine vom Browser gemeldeten JavaScript-Ausnahmen im Hauptkontext |

Die Zahl 111 zählt einzelne Assertions innerhalb eines integrierten Tests, nicht 111 isolierte Testdateien. Viele Dropdownkombinationen werden direkt per DOM-Ereignissen geprüft; zentrale Einstellungen, Schaltflächen und sichtbare Formulare werden zusätzlich über tatsächliche Playwright-Interaktionen bedient. Dadurch kann auch die Berechnung mit ausgeblendeten Einstellungen gezielt geprüft werden.

Zusätzlich ausgeführt: `node --check` für app.js, sw.js und tests/browser.cjs sowie `git diff --check`, ohne Befund. npm-Installation aus der Lockdatei erfolgreich. Die Produktionsanwendung selbst benötigt npm nicht.

## Visuelle Prüfung und Artefakte

Zwölf tatsächliche Vollseitenaufnahmen liegen in `screenshots/`:

- `320-light.png`, `320-dark.png`
- `375-light.png`, `375-dark.png`
- `390-light.png`, `390-dark.png`
- `1280-light.png`, `1280-dark.png`
- `320-compact.png`, `320-weld.png`, `320-settings.png`, `320-extreme.png`

Die Detailansichten bei 320/375/390 Pixeln und Desktop-Dunkelansicht sowie die vier zusätzlichen Ansichten wurden visuell angesehen. Bewertung: übersichtliche Karten, Outline-Amboss, zentrierte Miniatur, keine erkennbaren Überlappungen der Maßbeschriftungen und keine seitlich abgeschnittenen Bedienelemente. Bei 320 Pixeln bricht der App-Name sinnvoll auf zwei Zeilen um. Die ausgeklappte Ansicht bleibt in der Ergebniskarte. Blaue Länge oberhalb, türkise Breite unterhalb, orange Dicke rechts, jeweils parallel zur zugehörigen Kante und mit einheitlichen L-Endmarken. Dunkelmodus hat aufgehellte Maßfarben. Extreme Proportionen werden absichtlich mit Mindestgrößen dargestellt; lange Zeichnungszahlen in wissenschaftlicher Schreibweise.

Ein anfänglicher file://-Aufruf für die Icon-Erstellung wurde durch `ERR_BLOCKED_BY_ADMINISTRATOR` blockiert. Das ist keine erfolgreiche Browserprüfung gewesen. Anschließend wurden Icons aus dem vorhandenen SVG im Browser gerastert, und alle Anwendungstests über HTTP ausgeführt. Eine zunächst zu strenge Zentrierungstoleranz im Test wurde auf 0,02 SVG-Einheiten korrigiert, da gerundete Polygonpunkte und Browser-Floatwerte minimale Abweichungen verursachen.

## Nicht ausgeführt / Grenzen

- Kein echter Windows-PC und kein echtes iPhone; CSS-Breiten ersetzen keinen Safari-/iOS- oder Edge-Gerätetest.
- Keine echte PWA-Installation, iOS-Standalone-/Offlineprüfung oder Migration eines bereits installierten Originalclients.
- Kein Screenreaderlauf, keine vollständige WCAG-Prüfung, keine System-Schriftvergrößerung und keine mobile Bildschirmtastatur geprüft.
- Manueller Clipboard-Fallbackdialog wurde im Abschlusslauf nicht bedient; erfolgreicher Clipboard-Pfad ist automatisiert geprüft.
- Keine Herstellerdaten verifiziert, keine Schweißversuche und keine Bestätigung der technischen Eignung von Elektrodenkombinationen.
- Kein vollständiger Penetrationstest. Technische Sicherheitsaussagen beziehen sich auf Quellcodeprüfung und den dokumentierten Text-Injektionstest.

Diese Punkte bleiben als konkrete manuelle Abnahme vor einer produktiven Einführung offen; sie sind nicht als bestanden gewertet.
