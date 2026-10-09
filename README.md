# Die geheime Geburtstagsschatzsuche

Deutschsprachiges Geburtstagsspiel für Sofia und ihre Freundinnen auf einem gemeinsamen Tablet. Next.js App Router und React, ohne Accounts, Datenbank oder externe Dienste.

## Lokal starten

Node.js 22 verwenden (siehe `.nvmrc`):

```bash
nvm use
npm ci
npm run dev
```

Spiel: http://localhost:3000 · Druckbare Codekarten: http://localhost:3000/geheimcodes

Für einen Tablet-Test im selben WLAN `npm run dev -- --hostname 0.0.0.0` starten und auf dem Tablet `http://<IP-des-Computers>:3000` öffnen.

## Prüfen und Produktionsbuild

```bash
npm test
npm run build
npm start
```

## Auf Vercel veröffentlichen

1. Dieses Projekt inklusive `package.json` und `package-lock.json` in ein GitHub-Repository pushen.
2. In Vercel **Add New → Project** wählen und das Repository importieren.
3. Framework **Next.js**, Root Directory der Projektordner, Node.js **22.x**. Die Standard-Befehle für Installation und Build verwenden; Output Directory nicht überschreiben.
4. Deploy klicken und den HTTPS-Link auf dem Tablet öffnen. Keine Umgebungsvariablen nötig.

Die alten URLs `/index.html` und `/geheimcodes.html` werden auf die neuen Seiten weitergeleitet. Die ursprünglichen HTML-Dateien wurden durch die Next.js-Seiten ersetzt.

## Vor dem Geburtstag

`/geheimcodes` öffnen, auf **Codekarten drucken** tippen, alle sieben Karten ausschneiden und verstecken. Die Karte beim Meerschweinchen außen am Käfig anbringen. Die Karte am Spiegel löst das Finale aus. Geschenktüten an einem sicheren Ort verstecken; der letzte Bildschirm fordert die Kinder auf, sie zu suchen.

Einmal alle Missionen auf dem vorgesehenen Tablet durchspielen und anschließend **Neustart** wählen. Die Codekarten-Seite ist für die Vorbereitung gedacht und wird im Spiel nicht verlinkt; sie ist aber nicht passwortgeschützt.

## Spiellogik und Speicherung

- Das Gefrierschrank-Rätsel startet die Suche. Der erste Code vergibt den ersten Stern.
- Jede folgende Codekarte öffnet die nächste Aufgabe. Insgesamt gibt es acht Sterne.
- Bewegungsaufgaben bestätigt die Gruppe per Checkbox. Der Gedächtnistest dauert 15 Sekunden, die Finalpose zehn Sekunden.
- Fortschritt wird nur im lokalen Browser-Speicher gespeichert; keine Synchronisierung zwischen Geräten. Bestehende Spielstände des alten Spiels auf derselben Domain werden übernommen.
- Nach Neuladen startet eine laufende Zeitaufgabe erneut; bereits verdiente Sterne bleiben erhalten.
- Wenn der Browser das Speichern blockiert, bleibt das Spiel nutzbar und zeigt einen Hinweis. Die Seite dann geöffnet lassen.
- **Neustart** setzt den Spielstand nach Bestätigung zurück.
- Für das Laden oder Neuladen der gehosteten Version ist Internet erforderlich. Es gibt keinen Offline-Modus.

## Texte und Codes ändern

`lib/missions.js` enthält die Aufgaben, Orte und Codes. Die ersten sieben `code`-Einträge werden auch für die Druckkarten verwendet: nur einmal ändern, anschließend neu deployen und die Karten neu drucken. Der Finale-Eintrag benötigt keinen weiteren Code.

- `components/treasure-hunt.js`: Spieloberfläche, Eingaben und Zeitaufgaben
- `lib/game.js`: Validierung gespeicherter Spielstände und Codes
- `app/globals.css`: Tablet-Layout und Farben
- `app/geheimcodes/`: Druckansicht
