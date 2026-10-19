# Änderungsprotokoll

## v0.5.2 – App-Icon und Gewichtssymbol

- Metallisches kg-App-Icon nach Bildvorlage, PNG-Größen 192/512 und Apple-Touch-Icon 180 Pixel.
- Amboss in der Kopfzeile durch SVG-Gewicht ersetzt: im Hellmodus gefüllt, im Dunkelmodus als helle Kontur.
- Adaptives SVG-Favicon ergänzt; Offline-Cache auf 0.5.2 aktualisiert.
- Berechnungslogik unverändert; Browserprüfungen für Icons und Farbschemata ergänzt.
- 122 Assertions bestanden, zwölf Screenshots aktualisiert.

## v0.5.1 – Prüfung und Fehlerkorrekturen

- Einheitenwechsel und Reset erhalten physikalische Eingabewerte; Startwerte passen sich gespeicherten Einheiten an.
- Werkstoff gespeichert; lokale Präferenzen validiert und Speicherfehler abgefangen.
- Temporäre Elektrodenauswahl bleibt bei Farbwechsel und unabhängigen Einstellungsänderungen erhalten.
- Strengere Eingabevalidierung, Prüfung auf Rechenüber-/Unterlauf und wissenschaftliche Anzeige für extreme Werte.
- Lineare proportionale Werkstückprojektion mit optischen Mindestgrößen, weiterhin zentrierte Miniatur.
- Maßlinien außerhalb des Werkstücks, einheitliche L-Enden, geschützte Beschriftungsgrenzen und bessere Dunkelkontraste.
- Fokusführung, Aufklappzustände und zugängliche Fehlermeldungen ergänzt.
- Quadratmodell korrekt benannt; Nahtmasse, Verbrauch und ungeprüfte Elektrodenbezeichnungen deutlich unterschieden.
- Service-Worker-Cachebereinigung begrenzt; Offline-Assetliste, Manifest und PWA-Icons ergänzt.
- HTML/CSS/JavaScript lesbar aufgeteilt, ohne Laufzeitframework.
- Reproduzierbare Playwright-Tests, zwölf Screenshots sowie Prüf- und Testbericht ergänzt.

## v0.5.0 – Geometrie & Einstellungen (unveränderter ursprünglicher Eintrag)

- Name: Stahlgewicht Rechner; kleines Amboss-Outline-Logo
- Werkstückminiatur zentriert, dynamische Größenanpassung
- Aufklappbare Maßansicht innerhalb der Ergebniskarte
- Einheitlicher Maßlinien-Generator, Abstand der Bemaßungen angeglichen
- Ergebnis mit zwei Nachkommastellen, Millimeter-Hauptanzeige und Zentimeter-Umrechnung
- Standardelektrode konfigurierbar; Durchmesser ab Werk 2,0 mm
- Gespeicherte Einheiten, Elektrodenstandards und Hell-/Dunkelmodus
- PWA-Dateien für HTTPS-Bereitstellung
