# Technische Bestandsaufnahme und Korrekturen · 0.5.0 → 0.5.1

Stand: 19.10.2026. Alle sechs Originaldateien wurden vollständig gelesen: index.html, sw.js, icon.svg, manifest.webmanifest, README.md und CHANGELOG.md. Das Original liegt unverändert im Import-Commit und Tag v0.5.0. Keine fehlenden Laufzeitpakete oder externen Assets im Original; Tests und Paketverwaltung fehlten vollständig.

## Bestätigte Befunde

| Befund in 0.5.0 | Auswirkung / Korrektur in 0.5.1 |
|---|---|
| Einheitenwechsel interpretiert Zahlen neu | Beispielsweise 500 g → 500 kg. Jetzt werterhaltende Umrechnung, auch beim Zurücksetzen. |
| Gespeicherte Einheiten werden auf unkonvertierte Startzahlen angewendet | Nach Neustart konnte die Standardmasse um Größenordnungen springen. Startwerte werden jetzt in gespeicherte Einheiten konvertiert. |
| Werkstoff nicht gespeichert | Werkstoff wird jetzt persistiert und wiederhergestellt. |
| Farbwechsel oder Einstellungsänderung setzt laufende Elektrodenauswahl zurück | Präferenzen und temporäre Auswahl getrennt angewendet. |
| localStorage-Schreibfehler unbehandelt | Gesperrte Speicherung konnte UI-Aktionen abbrechen. Fehler werden abgefangen und angezeigt. |
| Geladene Präferenzen ungeprüft | Unbekannte Einheiten/Elektroden konnten leere Dropdowns und ungültige Berechnungen erzeugen. Zulässige Werte werden geprüft. |
| Nur Eingaben, nicht Rechenergebnisse auf Endlichkeit geprüft | Über-/Unterlauf konnte Infinity oder Länge null als Erfolg anzeigen. Ergebnis und Nahtmasse werden geprüft. |
| Eingabeparser entfernt sämtliche Leerzeichen | „1 2“ wurde zu 12. Innere Leerzeichen und gemischte Dezimaltrenner werden abgewiesen. Dezimalpunkt/-komma bleiben erlaubt. |
| Sehr kleine positive Ergebnisse erscheinen als 0,00 | Wissenschaftliche Anzeige außerhalb sinnvoller Festkommadarstellung. |
| Nichtlineare Geometrie verzerrt auch normale Proportionen stark | Gemeinsame lineare Skalierung mit Mindestgrößen nur für optisch sehr kleine Achsen. Zentrierung bleibt erhalten. |
| Blaue Maßlinie überdeckt die Oberseite, Breitenlinie sitzt nicht zuverlässig darunter | Länge über hinterer Längskante, Breite unter Unterkante und Dicke seitlich; gemeinsamer Generator bleibt erhalten. |
| Lange Beschriftungen können aus dem SVG ragen | Kompakte Exponentialdarstellung und an Inhalt angepasste viewBox. Maßfarben für beide Farbschemata angepasst. |
| Auf-/Zuklappen ohne Zustandsangabe und Fokusführung | aria-expanded, aria-controls und gezielter Fokuswechsel ergänzt; Fehlereingaben mit aria-invalid und Statusmeldungen. |
| Service Worker löscht alle anderen Caches derselben Origin | Bereinigung auf stahlgewicht-v-Präfix beschränkt; neue Dateien in Offline-Assetliste. |
| PWA nur mit SVG-Icon | PNG-Icons 192/512, Manifest-ID und Apple-Touch-Icon ergänzt. SVG-Outline bleibt erhalten. |
| „Rechteckquerschnitt“ hat nur eine Seitenlänge | Bezeichnung auf Quadratquerschnitt präzisiert; Formel unverändert. |
| Herstellerstatus der Elektrodennamen nicht ausdrücklich gekennzeichnet | Ungeprüfte Sortenbezeichnungen und fehlende Herstellerkennwerte in UI und README erklärt. |
| Keine Tests, minifizierter Gesamtcode in HTML | Lesbar formatierte HTML-/CSS-/JS-Dateien; versionierte Browser-Testumgebung mit Lockdatei. Keine Laufzeitbibliothek ergänzt. |

## Mathematische Bewertung

Die Hauptformel in 0.5.0 war korrekt und wurde fachlich beibehalten. Für ρ in g/cm³ gilt ρ × 10⁻⁶ kg/mm³. Daher ergibt `(kg / (kg/mm³ × mm²))` eine Länge in mm.

Referenz Stahl: 500 g, Dicke 20 mm, Breite 60 mm → `500 / (7,85 × 20 × 60) × 1000 = 53,078556… mm`, angezeigt 53,08 mm / 5,31 cm.

Umrechnungsfaktoren waren korrekt: mg → kg 10⁻⁶, g → kg 10⁻³, kg → kg 1, t → kg 1000; mm → mm 1, cm → mm 10, m → mm 1000.

Kehlnaht z=4 mm, Länge 100 mm: Volumen 800 mm³, Stahl-Schweißgut 6,28 g. Quadratmodell s=4 mm: 1600 mm³ und 12,56 g. Zusatzmasse wird vom gewünschten Gesamtgewicht abgezogen, bevor die Grundmateriallänge berechnet wird. Nahtmasse gleich/größer Zielmasse liefert keinen positiven zulässigen Grundkörper.

Die Nahtmodelle berechnen idealisierte Volumina und daraus Massen; tatsächliche Nahtgeometrie oder Elektrodenverbrauch lassen sich damit nicht bestimmen. Es gibt keine im Code hinterlegten Ausbringungsfaktoren oder Herstellerkennwerte. Die fehlende Lieferbarkeits-/Eignungsprüfung von Sorten, Längen und Durchmessern ist eine ausdrücklich dokumentierte Modellgrenze.

## Dokumentation und Architektur

README 0.5.0 beschrieb den neu interpretierenden Einheitenwechsel zutreffend; dies entsprach aber nicht der gewünschten Bedienung. Die Aussage „Millimeter-Hauptanzeige und Zentimeter-Umrechnung“ im ursprünglichen CHANGELOG galt nur für die Standardeinstellungen; die Ausgabe ist tatsächlich konfigurierbar. Die Offlinebehauptung setzte bereits einen erfolgreichen initialen Service-Worker-Start voraus. Diese Voraussetzungen sind jetzt eindeutig beschrieben.

Die statische Architektur bleibt bestehen. Die Aufteilung in app.js und styles.css dient Lesbarkeit und Wartbarkeit. Playwright ist eine reine Entwicklungsabhängigkeit. Vom Benutzer eingegebene Elektrodennamen werden per textContent ausgegeben; dynamische SVG-/Options-Markups bestehen aus fest definierten Texten beziehungsweise validierten numerischen Werten. Keine erkennbaren externen Requests, Trackingfunktionen oder Secret-Dateien. Produktionsheader wie CSP/HTTPS liegen in der Verantwortung der späteren Hosting-Konfiguration. Kein formales Security- oder Barrierefreiheitszertifikat.

## Offene Punkte

- Echte Windows-Browser, iOS Safari, VoiceOver/NVDA, Zoom und Hardwaretastatur auf Mobilgeräten noch manuell prüfen.
- Tatsächliche PWA-Installation, Update eines bereits installierten 0.5.0-Clients und iOS-Offlineverhalten noch auf Geräten prüfen.
- Herstellerfreigaben, belastbare Materialdichten und Schweißgutkennwerte sind nicht recherchiert oder bestätigt; keine Verbrauchsrechnung implementiert.
- Sehr extreme Proportionen erfordern Mindestdarstellungen; keine maßstabgetreue Fertigungszeichnung.
- Eingabedaten eines konkreten Auftrags sind bewusst nicht dauerhaft gespeichert. Nur Präferenzen werden gespeichert.
