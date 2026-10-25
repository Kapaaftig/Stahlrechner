# Änderungsprotokoll

## v0.7.0 – Wuchtgewicht Rechner und Verfahrensübersicht

- Anwendung in „Wuchtgewicht Rechner“ umbenannt; kg-Symbol und bisheriger GitHub-Pages-Pfad bleiben erhalten.
- Freigegebene Oberfläche mit getrennten Reitern „Rechner“ und „Wuchten verstehen“ übernommen. Recheneingaben bleiben beim Wechsel erhalten; Direktlinks und Tastaturbedienung ergänzt.
- Aufklappbare Abschnitte zu Verfahren A/B, Messwertdefinitionen, Korrekturläufen K1/K2/K3 und nicht möglichem Wuchtlauf. Unter 1 mm/s bleibt ein betriebliches Beispielziel, kein allgemeiner Grenzwert.
- Zwei vergrößerbare Prinzipskizzen, Quellen und PDF-Erklärungsentwurf mit Laufblatt eingebunden. Keine Original-Betriebsfotos veröffentlicht.
- Bisherigen lokalen Speicherschlüssel und mathematische Modelle unverändert beibehalten. Manifest, Kopiertext, Cacheversion und Offline-Assetliste aktualisiert.
- Produktidee eines späteren dritten Reiters „Wuchtlauf“ mit Schritt-für-Schritt-Eingabe für Variante A/B in ROADMAP.md festgehalten; noch keine neue automatische Wuchtberechnung.
- Regressionstests um Reiter, Direktlinks, Bilddialoge, responsive Darstellung sowie ein Upgrade von v0.6.1 einschließlich Offline-Erklärungen und Erhalt der Einstellungen erweitert.
- Prüfung: 7 Modelltests und 616 Browser-Assertions bestanden; zehn neue UI-Aufnahmen in beiden Farbschemata. Echte Windows-/iPhone-PWA-Abnahme bleibt manuell.

## v0.6.1 – Auto-Anzeige synchronisieren

- Beide Umschaltrichtungen des Automodus berechnen beim change-Ereignis neu; das Feld bleibt nicht versehentlich bei manuellen 100 mm stehen.
- Nach pageshow (einschließlich Zurück/Vorwärts) werden Feldzustände und Nahtwerte synchronisiert. Auch die Nahtaktivierung reagiert auf change.
- Präcache lädt Dateien explizit mit cache=reload, statt auf mögliche HTTP-Cachewerte zurückzugreifen.
- 23 neue Regression-Assertions prüfen ausschließlich den sichtbaren UI-Zustand, ohne calculate() aus dem Test aufzurufen.
- Gesamtlauf: 7 Modelltests und 560 Browser-Assertions bestanden. Versionshinweis zur früheren 0.6.0-preview.1 ohne Auto ergänzt.

## v0.6.0 – Automatische Nahtlänge und Elektrodenverbrauch

- Freigegebene Nahtdarstellung an der unteren sichtbaren Kante in Miniatur und Detail übernommen.
- Automodus standardmäßig vorausgewählt: zwei volle Nähte an den längeren Kanten, mit gemeinsamer Lösung von Werkstücklänge und Nahtmasse.
- Manuelle Gesamtlänge bleibt beim Umschalten und Einheitenwechsel erhalten; mittige Teilnähte, Prüfung auf zu große Länge.
- Verbrauchsschätzung mit Stabzahl, Bereitstellungsmenge, Kernstablänge, Reststück und Ausbringung.
- PHOENIX 120 K: 120 % aus verlinktem älterem Herstellerkatalog; sonst ausdrücklich unbestätigte 100-%-Annahme. Eigene Werte pro Sorte speicherbar.
- Nahtmodelle mit Skizze aus zwei Werkstücken, Naht und Elektrode; z/a erläutert. Standard-Nahtmaß als Beispielwert konfigurierbar.
- Reine mathematische Modelle in model.js, neuer Offline-Cache und erweiterter Kopiertext.
- 7 Modelltests, 537 Browser-Assertions und 69 Screenshots; keine JavaScript-Browserfehler.

## 0.6.0-preview.1 – Lokaler Darstellungstest

- Gemeinsame Nahtdarstellung an der sichtbaren unteren Längskante in Miniatur und Detailansicht.
- Mittige Teilnaht, optische Begrenzung bei dünnen Werkstücken, dezente Bodenfläche.
- Interaktive Vergleichsseite preview.html mit vier Geometriebeispielen und Hell-/Dunkelmodus.
- Berechnungslogik unverändert; noch kein Automodus, keine Änderung der GitHub-Veröffentlichung.
- 122 bisherige und 291 zusätzliche Assertions bestanden, 32 zusätzliche Browseraufnahmen.

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
