# Quellen und Geltungsbereich · v0.7.0

Die Angaben zum Elektrodenverbrauch wurden am 19.10.2026 geprüft. Die Verfahrensgrundlagen wurden für den Erklärungsentwurf ergänzt. Keine Daten werden automatisch aus dem Internet nachgeladen. Links dienen der Nachvollziehbarkeit, nicht einer Kompatibilitätsfreigabe.

1. [voestalpine Böhler Welding: Welding Consumables – Pipeline, Seite 28](https://www.voestalpine.com/division_stahl/content/download/51677/647045/file/voestalpine_Bohler_Welding_Welding_Consumables_Pipeline_Folder.pdf). PDF heruntergeladen und als Text geprüft: Eintrag PHOENIX 120 K, 120 % Ausbringung. Älterer Katalog; aktuelle Produkt-/Packungsdaten nicht bestätigt. Nur dieser Ausbringungswert wird sortenspezifisch vorbelegt. Die übrigen Produktdaten aus dem Katalog werden nicht als App-Vorgaben übernommen.
2. [TWI: Electrode efficiency greater than 100%](https://www.twi-global.com/technical-knowledge/faqs/faq-how-can-a-manual-metal-arc-electrode-have-an-electrode-efficiency-greater-than-100). Begründet die Bezugsgröße abgeschmolzener Kernstab und den möglichen Zusatz aus der Umhüllung. Daraus folgt die Zulässigkeit von Ausbringungsfaktoren über 1; keine Werte für weitere Sorten abgeleitet.
3. [TWI: Standard data for arc welding](https://www.twi-global.com/pdfs/best-practice-guides/bpsdawv1.pdf). Enthält Verbrauchsbeispiele mit einer Reststückannahme von 50 mm. In der App sind 50 mm ein änderbarer Modellwert, keine Zusicherung für eine bestimmte Elektrode.

Für PHOENIX Blau, PHOENIX Grün T, PHOENIX Spezial D, Thermanit 19/15 H, Thermanit 25/22 H und eigene Sorten wurden keine Ausbringungskennwerte bestätigt. Die dort voreingestellten 100 % und die Kernstabdichte 7,85 g/cm³ sind ausdrücklich unbestätigte, editierbare Rechenannahmen. Eignung und Lieferbarkeit der angebotenen Durchmesser/Längen werden nicht automatisch geprüft.

Der Standard z=4 mm ist eine fortgeführte Beispieleinstellung aus 0.5.x, keine Herstellerempfehlung für Ø 2 mm. Die Umrechnung a=z/√2 folgt allein aus der Geometrie einer idealen gleichschenkligen Kehlnaht.

## Betriebswuchten – Verfahrensgrundlagen

- [SKF Microlog AX Series, Machinery Balancing Module](https://www.skf.com/binaries/pub198/Images/MLOG_AX_CMXA80_v4-03_322986d0_UM-EN_tcm_198-247547.pdf): Prüf-/Korrekturgewichte und Zweiebenenverfahren.
- [SKF Microlog Analyzer dBX, User Manual Revision F](https://cdn.skfmediahub.skf.com/api/public/096aab407f043e44/pdf_preview_medium/SKF_Microlog_Analyzer_dBX_series_CMVA_90_User_Manual_Rev_F_pdf_preview_medium.pdf): Ausgangs-, Prüf- und Korrekturläufe.
- [Motionics, Single-Plane Rotor Balancing with Single-Channel Four-Run Method](https://www.motionics.com/downloads/HowTo%20-%20Single-Plane%20Rotor%20Balancing%20with%20Single-Channel%20Four-Run%20Method.pdf): Ausgangslauf und Umsetzung desselben Prüfgewichts auf 0°/120°/240° im geeigneten Ein-Ebenen-Fall; zusätzlicher Kontrolllauf nach der Korrektur.
- [SKF Technical Support, Maintaining Machinery Balance](https://skftechnicalsupport.zendesk.com/hc/en-us/articles/360022974074-Maintaining-Machinery-Balance-test-format-3-Word-import-via-Google-Drive): Diagnose, Vergleichbarkeit, Phasenbezug und Drehzahleinfluss. Einzelne Richtwerte werden nicht als allgemeine Freigabevorgabe übernommen.
- [ASHRAE Handbook, Kapitel 38, Testing, Adjusting, and Balancing](https://handbook.ashrae.org/Handbooks/A15/SI/A15_CH38/a15_ch38_si.aspx): mögliche andere Ursachen drehfrequenter Schwingungen. Keine Grenzwertableitung für große Prozessgebläse.
- [PRÜFTECHNIK VIBXPERT II Balancer, 12/2019](https://pruftechnik-dev.s3.us-west-1.amazonaws.com/wp-content/uploads/2025/02/24194154/VIBXPERT_II_Balancer_manual_LIT53_203_122019_en.pdf), Safety and operating notes: Ursachenprüfung, gesicherte Arbeiten und Befestigung nach Herstellervorgabe.

Das Beispielziel unter 1,00 mm/s und die AS-/NS-Bezeichnungen stammen aus den Anforderungen zur Anwendung. Die Quellen bestätigen keinen universellen Grenzwert und keine Eignung für einen bestimmten Läufer. H/V sind radiale Messrichtungen; ein Gehäusemesswert in mm/s ist nicht mit relativer Wellenschwingung gleichzusetzen. Aus der übermittelten Schmierstoffbezeichnung „TD68“ werden keine Herstellerdaten abgeleitet.

Die zwei Bilder sind generierte Prinzipskizzen, keine Hersteller- oder Montagezeichnungen. Der PDF-Erklärungsentwurf dokumentiert die ausführlichen Texte und offenen Angaben. Betriebsfotos werden nicht veröffentlicht.
