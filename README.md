# Stahlgewicht Rechner · v0.6.1

Lokale, responsive Web-App zur Berechnung eines rechteckigen Werkstücks nach Zielgewicht. Ohne Laufzeitbibliotheken, Build-Schritt oder externe Ressourcen. Gewichtsmodell, Einheiten und Eingabeprüfung sind in `model.js`/`app.js` getrennt; Benutzerangaben verbleiben im Browser. Externe Quellen werden nur über ausdrücklich angeklickte Links geöffnet.

## Versionshinweis

`0.6.0-preview.1` war ausschließlich ein Darstellungsentwurf ohne Automodus. Für Auto muss die Kopf-/Fußzeile der Anwendung mindestens v0.6.0 anzeigen. v0.6.1 korrigiert zusätzlich die Synchronisierung bei reinen change-Ereignissen und bei vom Browser wiederhergestellten Formularwerten. Es wird dabei nur der sichtbare Formularzustand neu berechnet; die zuletzt gewählte Auto-/Manuell-Einstellung wird nicht überschrieben.

Nach Entpacken einer neuen Version den alten lokalen Server beenden (Strg+C) und im **neuen** Projektordner starten. Für einen unabhängigen Test kann ein frischer Port, z. B. 8001, verwendet werden. So wird weder versehentlich aus einem alten Projektordner ausgeliefert noch der bisherige Service-Worker derselben Adresse verwendet.

## Start unter Windows

ZIP vollständig entpacken. Python 3 installieren, Terminal im Projektordner öffnen:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Dann `http://127.0.0.1:8000` in Edge, Chrome oder Firefox öffnen. Falls `py` fehlt, `python` verwenden. Terminal geöffnet lassen, Strg+C beendet den Server. Node.js ist nur für Tests erforderlich. Direktes `file://` ist nicht verlässlich und ermöglicht keinen Service Worker.

Für das iPhone über HTTPS bereitstellen. `127.0.0.1` auf dem Telefon verweist auf das Telefon selbst. In Safari kann die Seite über „Teilen → Zum Home-Bildschirm“ hinzugefügt werden. Metallische App-Icons (192/512 Pixel), Apple-Touch-Icon (180 Pixel) und ein adaptives kg-Favicon sind enthalten. Echte Installation auf iPhone/Windows ist weiterhin manuell abzunehmen.

## Bedienung

Gewünschtes Gesamtgewicht, Werkstoff, Dicke und Breite eingeben. Deutsche Dezimalkommas und Dezimalpunkte funktionieren ohne Tausendertrennzeichen; `1.234` bedeutet 1,234. Wissenschaftliche Schreibweise ist erlaubt. Werte werden standardmäßig mit zwei Nachkommastellen angezeigt; sehr kleine/große Ergebnisse verwenden Exponentialdarstellung.

Die Schweißnahtfunktion bleibt beim Start ausgeschaltet. Sobald sie eingeschaltet wird, ist **Nahtlänge automatisch** vorausgewählt:

- Zwei volle Nähte an den längeren Kanten: `Gesamtnahtlänge = 2 × max(Länge, Breite)`.
- Wenn die berechnete Länge kleiner als die Breite ist, wechseln Richtung und Zeichnung zur Breitenkante. Bei quadratischem Grundriss wird stabil die Längenrichtung verwendet.
- Die Gesamtlänge erscheint schreibgeschützt, mit zwei Nachkommastellen. Berechnet wird intern ungerundet.
- Auto ausschalten, um eine eigene Gesamtnahtlänge einzugeben. Je die Hälfte wird mittig auf beiden Seiten angeordnet. Der vorherige manuelle Wert bleibt beim Umschalten erhalten, auch nach einem Einheitenwechsel.
- Eine Gesamtnahtlänge, die nicht auf beide längeren Kanten passt, wird als ungültig zurückgewiesen. Null ist im manuellen Modus zulässig.
- Die schätzungsweise Nahtmasse gehört zum Zielgewicht. Ein- und Ausschalten verändert daher die benötigte Grundmateriallänge.

Miniatur und integrierte Detailansicht zeigen die Naht am **unteren Übergang zwischen Werkstück und Unterlage**. Nur die sichtbare Naht wird gezeichnet; die verdeckte Seite bleibt in der Masse enthalten. Die angedeutete Bodenfläche besitzt keine eigene Masse. Die Darstellung verwendet einen leicht konvexen Nahtkörper ohne Anspruch auf exakte reale Raupengeometrie. Bei Nahtmaß größer Werkstückdicke wird nur die Darstellung begrenzt; ein Hinweis benennt diese Abweichung. Werkstück und Naht sind schematisch und keine Fertigungszeichnung.

Längenbemaßung blau, Breite türkis, Dicke orange. Alle drei verwenden denselben Zeichenstil. Antippen der Miniatur erweitert dieselbe Ergebniskarte.

## Nahtmaß und Elektrode

Die Auswahl zeigt neben dem Nahtmodell zwei Werkstücke, die Naht und eine Elektrode im Querschnitt:

- **Kehlnaht · z:** gleichschenkliges Dreieck, Fläche `A = z²/2`. z ist die Schenkellänge, nicht das a-Maß; `a = z/√2` wird zusätzlich erklärt.
- **Quadratmodell · s:** vereinfachte Fläche `A = s²`; keine genormte Nahtform.

4 mm bleibt ein **Beispielwert**, nicht die automatisch passende Nahtgröße für Ø 2 mm. Elektrodendurchmesser bestimmt die erforderliche Nahtgeometrie nicht allein. Standard-Nahtmaß in Einstellungen verändern und dauerhaft speichern; es wird unabhängig vom Elektroden-Ø gewählt. Produktdatenblatt und Schweißvorgabe entscheiden über Eignung und Ausführung.

Elektrodensorte und Hersteller sind für die Längenberechnung optional. Sorte, Durchmesser und Stablänge fließen bei eingeschalteter Nahtfunktion in die separate Verbrauchsschätzung ein. Keine automatische Prüfung auf Lieferbarkeit, Materialeignung, Position, Strom oder Lagenzahl. Insbesondere legitimiert ein rechnerisches Ergebnis keine beliebige Kombination aus Aluminium und einer ausgewählten Stahlelektrode.

## Elektrodenverbrauch – Schätzung

Angezeigt werden eine rechnerische Stabzahl, eine auf volle Stäbe aufgerundete Bereitstellungsmenge und die insgesamt abzuschmelzende Kernstablänge. Die Aufrundung ist keine Anweisung, diese Stäbe vollständig zu verbrauchen.

Unter „Rechenannahmen anpassen“:

- Ausbringung = Masse des abgesetzten Schweißguts / Masse des abgeschmolzenen Kernstabs, in Prozent. Werte über 100 % sind möglich.
- Reststück pro Stab: voreingestellt 50 mm als ausdrücklich anpassbare Modellannahme.
- Kernstabdichte: voreingestellt 7,85 g/cm³ als anpassbare Näherung, unabhängig von der Werkstückauswahl.

**PHOENIX 120 K:** 120 % Ausbringung ist im älteren Herstellerkatalog „Welding Consumables – Pipeline“, gedruckte Seite 28, angegeben. Das ist keine bestätigte aktuelle Packungs-/Chargenangabe. Im UI ist die Quelle verlinkt; ein aktuelles Datenblatt hat Vorrang. Für alle anderen Sorten sind 100 % ausschließlich eine **unbestätigte Rechenannahme**, keine behaupteten Herstellerdaten. Eigene Ausbringungswerte lassen sich pro Sorte speichern und gezielt zurücksetzen.

Die Schätzung berücksichtigt das eingetragene Reststück. Reale Verluste, Nahtüberhöhung, Einbrand und Verarbeitung können vom Modell abweichen. Der Verbrauch ist kein Nachweis dafür, dass das geforderte Nahtmaß oder die Festigkeit erreicht wird. Bei ungültigen Verbrauchsannahmen bleibt eine gültige Werkstückberechnung verfügbar; die Verbrauchsanzeige zeigt „—“ und einen Hinweis.

## Formeln

Einheiten intern: kg, mm, Dichte ρ in g/cm³. Werkstückdichten: Stahl 7,85; Edelstahl pauschal 7,9; Aluminium pauschal 2,7. Nahtdichte wird näherungsweise gleich Werkstückdichte gesetzt.

Ohne Naht: `L = m × 10^6 / (ρ × B × D)`.

Manuell: `m_Naht = A × N × ρ / 10^6`; `L = (m − m_Naht) × 10^6 / (ρ × B × D)`.

Automatik wird ohne iterative Näherung gemeinsam gelöst. Mit `V = m × 10^6 / ρ` gilt `V = L × B × D + 2 × A × max(L,B)`:

- Kandidat `L = V / (B × D + 2 × A)`. Wenn L ≥ B, ist dies das Ergebnis.
- Sonst `L = (V − 2 × A × B) / (B × D)`.
- Nicht positive oder nicht endliche Ergebnisse sind ungültig. Ein zu kleines Zielgewicht kann bereits von den zwei Nähten entlang der festen Breite ausgeschöpft sein.

Verbrauch mit Elektrodendurchmesser dₑ, Stablänge R, Reststück r, Kernstabdichte ρₑ und Ausbringungsfaktor η (z. B. 1,20):

`Kernmasse pro mm [g/mm] = π × dₑ²/4 × ρₑ / 1000`

`Abzuschmelzende Kernlänge [mm] = Nahtmasse [g] / (η × Kernmasse pro mm)`

`Stabzahl = Kernlänge / (R − r)`; Bereitstellungsmenge = aufrunden auf ganze Stäbe.

## Speicherung und Updates

Gespeichert werden Einheiten, Werkstoff, Standardelektrode, Ø, Länge, Standard-Nahtmaß, Farbmodus, Reststück, Kernstabdichte und gültige eigene Ausbringungswerte pro Sorte. Einstellungen aus 0.5.x erhalten geprüfte neue Standardwerte. Gesperrter Speicher verhindert die Berechnung nicht.

Aktuelle Auftragsmaße, Nahtaktivierung und Auto/Manuell-Modus werden nicht dauerhaft gespeichert. Beim Neuladen startet die Nahtfunktion aus, Auto ist ausgewählt. Startwerte: 500 g, 20 × 60 mm, jeweils in die bevorzugten Einheiten konvertiert; Nahtmaß aus den Einstellungen. Einheitentausch erhält gültige physikalische Eingabewerte.

Der versionierte Service Worker hält die Anwendung nach erfolgreichem Erstladen offline bereit. Nach einem Update alte Tabs neu laden. App-Icons können zusätzlich vom Betriebssystem zwischengespeichert sein. Für spätere Releases Cache-Version und Assetliste aktualisieren; fremde Caches werden nicht entfernt.

## Tests und Quellen

Node.js 20+ installieren, danach:

```powershell
npm ci
npx playwright install chromium
npm run test:all
```

Tests starten selbst lokale HTTP-Server auf 127.0.0.1. Unter Linux wird ein vorhandener `/usr/bin/chromium` verwendet, sonst Playwright-Chromium. `CHROMIUM_PATH` kann einen anderen Chromium-Pfad vorgeben. Laufzeit und Benutzeroberfläche benötigen npm nicht.

[Testbericht](TESTBERICHT.md) · [Änderungen](CHANGELOG.md) · [Technische Quellen](QUELLEN.md). `preview.html` bleibt als Vergleichsseite mit manuellen Beispielen für die Darstellung verfügbar; sie ist nicht Bestandteil des Offline-Caches. Die aktuelle App enthält den produktiven Auto-Schalter.

Der lokale ZIP-Export enthält Git-Historie einschließlich der Ausgangsversion und des freigegebenen Darstellungsentwurfs. Der über die GitHub-Weboberfläche importierte Repository-Verlauf ist davon unabhängig; dessen neue Änderungen werden als Pull Request bereitgestellt.
