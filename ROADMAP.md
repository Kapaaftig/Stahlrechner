# Geplante Weiterentwicklung

## Später: dritter Reiter „Wuchtlauf“

Festgehaltene Produktidee; **nicht Bestandteil von v0.7.0**. Die beiden bestehenden Reiter „Rechner“ und „Wuchten verstehen“ bleiben erhalten. Ein späterer dritter Reiter soll die Eingabe und Auswertung von Messergebnissen Schritt für Schritt begleiten.

### Gemeinsamer Einstieg

- Anlage/Läufer, Messverfahren A oder B und verfügbare Messkanäle auswählen.
- AS = Antriebsseite, NS = Nebenseite; H/V je Messstelle getrennt. Motorlager optional ergänzen.
- Messgröße, Filter/Frequenzbereich, Amplitudendefinition, Drehzahl und Betriebszustand festhalten.
- Nullmarke, Blickrichtung, Winkelzählung, freigegebene Korrekturebenen und wirksame Radien dokumentieren.
- Betriebliches Ziel und maßgebliche Kanäle angeben; „unter 1 mm/s“ ist ein konfigurierbares Beispielziel, kein allgemeiner Grenzwert.

### Variante A: Amplitude und Phase

Geführte Eingabe von Ausgangslauf, bekanntem Prüfgewicht und Prüflauf. Danach Korrektur und Kontrolllauf dokumentieren; weitere Korrekturläufe K2/K3 müssen möglich sein. Eindeutig zwischen einer zusätzlichen Gewichtsänderung und einem neu herzustellenden Gesamtgewichtszustand unterscheiden. Verfahren und gegebenenfalls Mehr-Ebenen-Auswertung vor einer automatischen Berechnung fachlich festlegen.

### Variante B: Amplituden ohne Phase

Geführte Eingabe des Ausgangslaufs und der drei Prüfläufe mit demselben Prüfgewicht bei 0°, 120° und 240°, gleichem Radius und vergleichbaren Bedingungen. Anschließend Auswertung, Korrektur und zusätzlicher Kontrolllauf. Ein Berechnungsmodul ist erst nach Prüfung der Messdateneignung und der Grenzen des Ein-Ebenen-Verfahrens vorgesehen. Das Verfahren ist keine allgemeine Zweiebenenlösung.

### Durchgängige Anforderungen

- Fortschrittsanzeige, verständliche Eingabeprüfung und nachvollziehbare Rücksprünge zwischen Schritten.
- Prüfgewicht, entfernte Gewichte und tatsächlich verbleibende Gewichte mit Radius/Winkel dokumentieren; Schweißgut gehört zur Gesamtmasse.
- Abgebrochene, instabile oder nicht vergleichbare Läufe als solche speichern und von einer Korrekturberechnung ausschließen.
- Alle festgelegten Zielkanäle bewerten. Ein Zahlenwert allein erzeugt keine Betriebsfreigabe.
- Speicherung, Export und Übergabe eines bestätigten Korrekturgewichts an den bestehenden Gewicht-Rechner gesondert abstimmen.

Vor Umsetzung erforderlich: verfügbare Gerätedaten und Messwertdefinitionen, zulässige Ebenen/Positionen, Winkelkonvention sowie anlagenspezifische Wucht-, Abbruch- und Freigabevorgaben. Zunächst die veröffentlichte v0.7.0 im Betrieb erproben.
