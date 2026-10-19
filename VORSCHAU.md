Historischer Darstellungsentwurf. Ab v0.6.0 ist der Automodus eingebaut; aktuelle Anleitung: README.md. Die Vergleichsseite verwendet zur gezielten Darstellung weiter feste manuelle Beispiele.

# Schweißnahtdarstellung · 0.6.0-preview.1

Dieser Entwurf dient der gemeinsamen visuellen Abnahme. Keine Veröffentlichung auf GitHub, kein Merge nach main und noch kein freigegebener Automodus. Ausgangspunkt ist v0.5.2. Die Gewichtsformel und die Bedeutung der eingegebenen Gesamtnahtlänge sind unverändert.

## Selbst testen

ZIP entpacken, Terminal im entpackten Projektordner öffnen:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Danach `http://127.0.0.1:8000/preview.html` aufrufen. Die Vergleichsseite zeigt die echte Anwendung in zwei Fenstern: links die bedienbare Miniatur, rechts die bereits aufgeklappte Detailansicht. Oben stehen vier Beispiele und beide Farbmodi zur Auswahl. Alternativ `http://127.0.0.1:8000/index.html` öffnen, Schweißnaht einschalten und eigene Maße ausprobieren.

„Durchgehend“ ist ein vorberechnetes Beispiel für die Geometrie und kein funktionierender Auto-Schalter. Bei Änderung der Eingaben bleibt die aktuelle Berechnung mit manueller Gesamtnahtlänge aktiv. Die Demonstrationsbeispiele verwenden 200 mm Länge, 60 mm Breite, 12 bzw. 2 mm Dicke und 4 mm Nahtmaß. Das passende Gesamtgewicht wird für jedes Beispiel vorbelegt.

## Was umgesetzt ist

- Gemeinsame Naht-Zeichenfunktion für Miniatur und Detail, mit leicht konvexem Profil an der unteren sichtbaren Längskante.
- Dezente Bodenfläche ohne eigene Dicke, kein weiterer Körper im Gewichtsmodell. Das Werkstück bleibt in seiner bisherigen flachen Orientierung.
- Nur die sichtbare Naht wird gezeichnet. Die Gewichtsbilanz berücksichtigt wie bisher die gesamte eingegebene Nahtlänge.
- Die Gesamtlänge wird gedanklich halbiert: zwei gleich lange Nähte. Sichtbare Teilnaht mittig, mit gleichen freien Enden.
- Nahtausdehnung über die projizierten Werkstückachsen, ohne künstliche zusätzliche Mindest-Nahthöhe. Miniatur inklusive Boden/Naht wird zentriert und ins Feld eingepasst.
- Nahthöhe und Querschnittsausdehnung werden für die Zeichnung auf min(Nahtmaß, Werkstückdicke) begrenzt. Die Gewichtsbilanz behält das eingegebene Nahtmaß. Ein Hinweis macht die Abweichung sichtbar.
- Falls die manuelle Gesamtnahtlänge mehr als 2 × Werkstücklänge beträgt, begrenzt dieser Entwurf die Zeichnung auf volle Kantenlänge und zeigt einen Hinweis. Die Eingabe wird nicht geändert.
- Keine gezeichnete Naht bei ausgeschalteter Funktion, Null-Nahtlänge oder ungültiger Berechnung.

Die konvexe Fläche ist eine schematische Darstellung des vorhandenen idealisierten Nahtmodells. Sie beansprucht keine exakte Volumenabbildung einer realen Schweißraupe. Nahtgröße und Zeichnung können durch die bereits vorhandenen Mindestdimensionen des Grundkörpers zusätzlich schematisch wirken. Bei der Miniatur ist eine dünne Naht absichtlich nur als schmaler Streifen erkennbar; die Detailansicht zeigt sie deutlicher.

## Tests und Artefakte

Ausgeführt über lokalen HTTP-Server auf 127.0.0.1 in Chromium unter Linux, Playwright 1.56.1:

- `npm test`: 122 bestehende Assertions bestanden; zwölf Basisaufnahmen.
- `npm run test:weld`: 291 zusätzliche Assertions bestanden; 32 Aufnahmen der tatsächlichen Ergebniskarten.

Die zusätzlichen Tests kombinieren 375 und 1280 Pixel, Hell/Dunkel, durchgehende/mittige und normale/dünne Werkstücke sowie Miniatur/Detail. Geprüft: korrekte Beispiel-Länge und Nahtmasse, symmetrische Teilung, Höhenbegrenzung, Zentrierung, Zeichnungsgrenzen, kein Dokumentüberlauf und Entfernen der Naht bei Deaktivierung/Null. Keine JavaScript-Browserfehler in beiden Testläufen. Screenshots: `screenshots/weld-preview/`.

Visuell gesichtet wurden mobile Miniatur und Detail für durchgehende Naht, dunkle Detailansicht mit Teilnaht sowie dünnes Werkstück. Die Naht liegt jeweils am Fuß des Werkstücks; keine Naht auf der Oberseite. Bilder sind echte Playwright-Aufnahmen, keine generierten Konzeptgrafiken.

Echte iPhone-/Windows-Geräte und Safari bleiben ungeprüft. Die Vergleichsseite ist eine Entwicklungsansicht und gehört noch nicht zur Offline-Assetliste. Keine neue vollständige PWA-Abnahme.

## Vor Freigabe noch zu entscheiden

1. Automodus: Vorgehen, wenn die Breite größer als die berechnete Länge ist; Aktivierung der gesamten Schweißnahtfunktion beim Start.
2. Dünnes Werkstück: nur optische Begrenzung wie hier oder auch Änderung des berechneten Nahtmaßes.
3. Überlange manuelle Naht: endgültige Fehlermeldung statt der hier verwendeten visuellen Begrenzung.
4. Gestaltung: Naht maßstäblich dezent belassen oder eine ausdrücklich gekennzeichnete optische Verstärkung für die Miniatur wünschen.
