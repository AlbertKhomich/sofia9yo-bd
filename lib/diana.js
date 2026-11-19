export const DIANA_STORAGE_KEY = "diana-case-009-v1";
export const MUSIC_CODE = "41536";

// German alphabet with umlauts for the cipher
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ";

// Encoded version of "KAFFEEMASCHINE" (shift +1)
export const DIANA_CIPHER = "LBGGFFNB TDIJOF".replaceAll(" ", "");

export const DIANA_MIRROR = "LHUTS MED RETNU EHCUS";

export const INITIAL_DIANA_STATE = {
  stage: -1,
  startedAt: null,
  finishedAt: null,
  music: "",
};

export const DIANA_MISSIONS = [
  {
    title: "Regen ohne Wolken",
    icon: "💧",
    code: "2741",
    place: "Im Badezimmer, neben den Zahnbürsten",
    text:
      "An diesem Ort regnet es ohne Wolken.\n" +
      "Ein Spiegel kennt hier jedes deiner Geheimnisse.\n" +
      "Niemand wundert sich, wenn du hier nass wirst.\n" +
      "Schwimmen musst du hier aber nicht.\n" +
      "Und manchmal wird hier sogar gesungen!",
    type: "letters",
  },
  {
    title: "Das Rätsel des Alchemisten",
    icon: "⚗️",
    code: "6832",
    place: "Neben der Kaffeemaschine",
    text:
      "LBGGFFNBTDIJOF.\n" +
      "Jeder Buchstabe wurde im Alphabet um eine Stelle nach vorne verschoben.\n" +
      "Gehe bei jedem Buchstaben einen Schritt zurück, um das Geheimnis zu lösen!",
    type: "cipher",
  },
  {
    title: "Die falsche Spur",
    icon: "🕵️",
    code: "9514",
    place: "Zwischen den Sofakissen",
    text:
      "Ein Zeuge sagt die Wahrheit, der andere lügt.\n\n" +
      "Zeuge A: „Der Hinweis liegt dort, wo die Menschen jede Nacht schlafen.“\n\n" +
      "Zeuge B: „Der Hinweis liegt nicht auf einem Bett. Sucht den Gegenstand, der Fernbedienungen, Münzen und Spielzeug verschluckt.“",
    type: "witness",
  },
  {
    title: "Drei Wege",
    icon: "🪜",
    code: "3268",
    place: "Neben der untersten Stufe der Dachbodentreppe",
    text:
      "Der Täter hat drei mögliche Wege hinterlassen:\n\n" +
      "A – nach unten\n" +
      "B – nach oben\n" +
      "C – nach draußen, zu den Bäumen\n\n" +
      "„Ich habe das Haus nicht verlassen.\n" +
      "Ich bin auch nicht nach unten gegangen.\n" +
      "Mein nächstes Geheimnis liegt auf dem Weg zum höchsten Raum des Hauses.“",
    type: "route",
  },
  {
    title: "Das königliche Geheimnis",
    icon: "👑",
    code: "8073",
    place: "Unter Dianas Bett",
    text:
      "In diesem Haus lebt heute eine echte Prinzessin.\n" +
      "Aber sie trägt keine richtige Krone.\n" +
      "Jede Nacht reist sie in eine andere Welt, ohne ihr Zimmer zu verlassen.\n" +
      "Sucht dort, wo das Licht nicht hinkommt und vergessene Dinge liegen.",
    type: "royal",
  },
  {
    title: "Der musikalische Code",
    icon: "🎹",
    code: "5629",
    place: "Am Klavier, neben den Noten",
    text:
      "FA – DO – SOL – MI – LA\n\n" +
      "Jede Note hat eine Nummer:\n" +
      "DO = 1, RE = 2, MI = 3, FA = 4, SOL = 5, LA = 6, SI = 7.\n\n" +
      "Verwandelt die Noten in Zahlen und merkt euch den Code für das Finale.\n\n" +
      "Den nächsten Hinweis findet ihr dort, wo weiße und schwarze Tasten nebeneinander wohnen.",
    type: "music",
  },
  {
    title: "Der lebendige Zeuge",
    icon: "🌱",
    code: "1496",
    place: "Auf der Rückseite eines Blumentopfs mit einer Zimmerpflanze",
    text:
      "Ich lebe, aber ich habe kein Herz.\n" +
      "Ich wachse, aber werde nicht erwachsen wie ein Mensch.\n" +
      "Ich trinke, aber ich brauche kein Glas.\n" +
      "Ich brauche Licht, kann aber keine Lampe einschalten.\n" +
      "Zu viel Fürsorge kann mir sogar schaden.\n\n" +
      "Der Hinweis liegt ganz in meiner Nähe, aber nicht in der Erde.",
    type: "plant",
  },
  {
    title: "Die letzte Nachricht",
    icon: "🪞",
    code: "7305",
    place: "Im letzten Umschlag unter einem Stuhl im Esszimmer",
    text:
      "LHUTS MED RETNU EHCUS\n\n" +
      "Lest die Nachricht von rechts nach links.\n" +
      "Nicht jedes Geheimnis ist weit entfernt.\n" +
      "Manchmal liegt es direkt unter euch.",
    type: "mirror",
  },
];

export function restoreDiana(value) {
  if (
    !value ||
    !Number.isInteger(value.stage) ||
    value.stage < -1 ||
    value.stage > 9
  )
    return { ...INITIAL_DIANA_STATE };

  if (value.stage === -1) return { ...INITIAL_DIANA_STATE };

  if (
    !Number.isFinite(value.startedAt) ||
    value.startedAt <= 0 ||
    value.startedAt > Date.now()
  )
    return { ...INITIAL_DIANA_STATE };

  if (
    value.stage === 9 &&
    (!Number.isFinite(value.finishedAt) ||
      value.finishedAt < value.startedAt ||
      value.finishedAt > Date.now())
  )
    return { ...INITIAL_DIANA_STATE };

  return {
    stage: value.stage,
    startedAt: value.startedAt,
    finishedAt: value.stage === 9 ? value.finishedAt : null,
    music: value.music === MUSIC_CODE ? MUSIC_CODE : "",
  };
}

export function acceptsDianaCode(stage, value, music = "") {
  if (stage === 5 && music !== MUSIC_CODE) return false;

  const expected = stage === 8 ? MUSIC_CODE : DIANA_MISSIONS[stage]?.code;

  return typeof value === "string" && !!expected && value.trim() === expected;
}

export function shiftDianaLetter(letter, shift) {
  return ALPHABET[
    (ALPHABET.indexOf(letter) + shift + ALPHABET.length) % ALPHABET.length
  ];
}
