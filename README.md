# Stahlgewicht Rechner · v0.5.2

Lokale Web-App zur Berechnung der Länge eines rechteckigen Werkstücks. Keine Laufzeitabhängigkeiten, kein Build-Schritt, keine Cloud und keine externen Ressourcen. Ausgangsversion: unveränderter ZIP-Import v0.5.0 im Git-Tag `v0.5.0`.

## Lokal unter Windows starten

1. ZIP vollständig entpacken, nicht direkt im ZIP öffnen.
2. Python 3 installieren, falls noch nicht vorhanden (python.org, Python Launcher mitinstallieren).
3. Im entpackten Ordner `stahlgewicht-rechner` ein Terminal öffnen.
4. `py -m http.server 8000 --bind 127.0.0.1` ausführen. Alternativ `python -m http.server 8000 --bind 127.0.0.1`.
5. In Edge, Chrome oder Firefox `http://127.0.0.1:8000` öffnen. Terminal geöffnet lassen; Strg+C beendet den Server.

Node.js und npm werden ausschließlich für die automatisierten Tests benötigt. Ein direkter Doppelklick auf `index.html` ist kein verlässlicher Startweg: Browserrichtlinien können `file://` sperren; Service Worker funktionieren dort nicht.

## Bedienung und Speicherung

- Gesamtgewicht, Werkstoff, Dicke und Breite eingeben; die benötigte Länge wird sofort berechnet.
- Dezimalkomma und Dezimalpunkt sind zulässig, ohne Tausendertrennzeichen. `1.234` bedeutet 1,234 und nicht 1234. Wissenschaftliche Schreibweise wie `1e-3` wird akzeptiert.
- Die Miniatur öffnet eine Maßansicht innerhalb derselben Ergebniskarte. Länge blau, Breite türkis, Dicke orange; ein gemeinsamer Generator zeichnet parallele Maßlinien mit kurzen L-Enden.
- Zahnrad öffnet Einstellungen. Einheitenwechsel konvertieren gültige Eingabewerte und erhalten deren physikalische Bedeutung. Ungültiger Text bleibt unverändert und muss korrigiert werden.
- Einheiten, Werkstoff, Standardelektrode, Durchmesser, Elektrodenlänge und Farbmodus werden im jeweiligen Browser gespeichert. Werkstoffwechsel im Hauptformular gilt als neue Präferenz.
- Aktuelle Gewichts-/Maßeingaben, Nahtaktivierung und temporäre Elektrodenanpassungen werden nicht gespeichert. Nach Neuladen gelten die Startwerte 500 g, 20 mm Dicke, 60 mm Breite, 100 mm Nahtlänge und 4 mm Nahtmaß, jeweils in die gespeicherten Einheiten umgerechnet.
- „Standardeinstellungen“ setzt Präferenzen zurück und konvertiert aktuelle gültige Eingaben in die Standardeinheiten. Standarddurchmesser: 2,0 mm; Standardlänge: 350 mm.
- Ein Farbwechsel verändert keine temporär angepasste Elektrodenauswahl. Gesperrte Speicherung verhindert die Berechnung nicht; beim Speicherversuch erscheint ein Hinweis.
- „Ergebnis kopieren“ kopiert Text; bei fehlender Clipboard-Berechtigung erscheint ein manueller Kopierdialog.

## Berechnung und Grenzen

Intern: Masse in kg, Maße in mm, Dichte in g/cm³ (numerisch gleich kg/dm³).

`L_mm = (m_gesamt_kg − m_naht_kg) × 10^6 / (ρ × Dicke_mm × Breite_mm)`

Dichten: Stahl 7,85; Edelstahl pauschal 7,9; Aluminium pauschal 2,7 g/cm³. Das sind allgemeine Näherungswerte, keine chargen- oder herstellerspezifischen Materialkennwerte.

Die Naht ist ein idealisierter Zusatzkörper:

- Gleichschenklige Kehlnaht: Querschnitt `z² / 2`, z ist die Schenkellänge, nicht das a-Maß.
- Quadratmodell: Querschnitt `s²`; kein beliebiger Rechteckquerschnitt mit zwei unabhängigen Seiten.
- Nahtvolumen `V_mm³ = Querschnitt_mm² × Nahtlänge_mm`.
- Schweißgutmasse `m_naht_kg = V_mm³ × ρ / 10^6`, mit derselben Dichte wie das Werkstück.

Nahtlänge darf null sein; Nahtmaß, Werkstückmaße und Gesamtgewicht müssen positiv sein. Nahtmasse muss kleiner als das Gesamtgewicht bleiben. Nicht darstellbare Rechenergebnisse werden abgewiesen. Ergebnisse standardmäßig mit zwei Nachkommastellen; sehr kleine Werte unter 0,005 sowie Werte ab 10¹² werden wissenschaftlich dargestellt, damit positive Ergebnisse nicht als null erscheinen. Zeichnungsbeschriftungen wechseln zusätzlich ab 10⁷ zur wissenschaftlichen Schreibweise.

Die Grafik ist eine schematische isometrische Projektion mit gemeinsamer Skalierung. Sehr dünne/kurze Achsen haben kontrollierte optische Mindestgrößen; sie ist keine Fertigungszeichnung.

Elektrodensorten einschließlich PHOENIX und Thermanit sind ungeprüfte Bezeichnungen aus der Ausgangsversion. Es wurden keine Herstellerangaben ergänzt oder bestätigt. Durchmesser, Sorte und Stablänge dokumentieren die Auswahl; Kombinationen werden nicht auf Lieferbarkeit oder Eignung geprüft. Es gibt keine Verbrauchs-, Ausbringungs- oder Elektrodenstückzahlberechnung. Tatsächliches Nahtvolumen, Schweißgutmasse und Elektrodenverbrauch sind unterschiedliche Größen. Überhöhung, Einbrand, Verluste und abweichende Schweißgutdichte sind nicht modelliert.

## Tests reproduzieren

Node.js 20 oder neuer installieren. Im Projektordner:

```powershell
npm ci
npx playwright install chromium
npm test
```

Der Test startet selbst einen HTTP-Server auf `127.0.0.1` mit freiem Port und beendet ihn anschließend. Er verwendet auf dieser Linux-Umgebung `/usr/bin/chromium`, sonst den von Playwright installierten Chromium. Bei Bedarf kann `CHROMIUM_PATH` einen anderen Chromium-Pfad vorgeben. Screenshots werden in `screenshots/` aktualisiert. Internet ist nur zur Installation der Testwerkzeuge erforderlich.

Ergebnisse und Grenzen: [TESTBERICHT.md](TESTBERICHT.md). Ausgangsbefund und Korrekturen: [PRUEFBERICHT.md](PRUEFBERICHT.md).

## PWA und Offlinebetrieb

Service Worker, Manifest, adaptives Gewicht-SVG und metallische PNG-App-Icons mit 192/512 Pixeln sind enthalten; iOS erhält ein separates Apple-Touch-Icon mit 180 Pixeln. Nach dem ersten erfolgreichen Laden über localhost oder HTTPS ist die App offline verfügbar. Für ein iPhone ist eine erreichbare HTTPS-Bereitstellung erforderlich; `127.0.0.1` auf dem iPhone verweist auf das Telefon selbst. Anschließend in Safari „Teilen → Zum Home-Bildschirm“ verwenden. Installation und Bedienung auf realen Geräten sind noch zu prüfen.

Der Service Worker nutzt einen versionierten Cache. Bei späteren Releases Cache-Version und Assetliste aktualisieren; alte offene Tabs nach dem Update neu laden. Fremde Caches werden nicht gelöscht. Auf einer produktiven Bereitstellung HTTPS verwenden; HTTP auf einem beliebigen LAN-Host ist kein Ersatz für einen sicheren PWA-Kontext.

## Dateien und Git

- `index.html`, `styles.css`, `app.js`: Oberfläche, Gestaltung und Logik
- `sw.js`, `manifest.webmanifest`, Icons: Offlinebetrieb und Installationsgrundlagen
- `tests/browser.cjs`, `package*.json`: reproduzierbare Browserprüfungen, ausschließlich Entwicklungsabhängigkeiten
- `screenshots/`: tatsächliche Testaufnahmen
- `PRUEFBERICHT.md`, `TESTBERICHT.md`, `CHANGELOG.md`: Befunde und Ergebnisse

Die Übergabe enthält das Git-Repository einschließlich der Tags `v0.5.0`, `v0.5.1` und `v0.5.2`. `git log --oneline` zeigt die Änderungen, `git diff v0.5.0 v0.5.2` den vollständigen Vergleich.

## App-Icon ab 0.5.2

Das metallische kg-Gewicht dient als Launcher-Icon; die Quelldatei liegt in `icon-source.png`. Das Bild wurde anhand der angehängten Vorlage aufbereitet. Die Kopfzeile zeigt ein separat gezeichnetes, skalierbares Clipart: dunkel gefüllt im Hellmodus, helle Kontur im Dunkelmodus. Das Favicon folgt dem Farbschema des Browsers.

Die neue Cache-Version lädt die aktualisierten Assets nach dem nächsten Service-Worker-Update; bei geöffneten alten Tabs anschließend neu laden. Bereits installierte Apps können das alte Launcher-Icon betriebssystemseitig länger zwischenspeichern; bei Bedarf die Verknüpfung entfernen und neu hinzufügen.
