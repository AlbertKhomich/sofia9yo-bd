export const DIANA_STORAGE_KEY = "diana-case-009-v1";
export const MUSIC_CODE = "41536";
export const DIANA_CIPHER = "ЛПХЁНБЩЙОБ";
export const DIANA_MIRROR = "ЙОВОЛОТС В МОЛУТС ДОП ИЩИ";
export const ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
export const INITIAL_DIANA_STATE = {
  stage: -1,
  startedAt: null,
  finishedAt: null,
  music: "",
};
export const DIANA_MISSIONS = [
  {
    title: "Дождь без облаков",
    icon: "💧",
    code: "2741",
    place: "В ванной, рядом с зубными щётками",
    text: "В этом месте дождь идёт без туч.\nА отражение знает каждый твой секрет.\nНикто не удивится, если здесь ты мокрый.\nНо плавать здесь совсем не обязательно.\nА иногда здесь даже поют!",
    type: "letters",
  },
  {
    title: "Загадка алхимика",
    icon: "⚗️",
    code: "6832",
    place: "Возле кофемашины",
    text: "ЛПХЁНБЩЙОБ. Каждая буква сдвинута на одну позицию вперёд по русскому алфавиту. Буква Ё тоже участвует!",
    type: "cipher",
  },
  {
    title: "Ложный след",
    icon: "🕵️",
    code: "9514",
    place: "Между подушками дивана",
    text: "Один свидетель говорит правду, другой лжёт.\nА: «Улика там, где люди спят каждую ночь».\nБ: «Улика не на кровати. Ищите предмет, который проглатывает пульты, монеты и игрушки».",
    type: "witness",
  },
  {
    title: "Три маршрута",
    icon: "🪜",
    code: "3268",
    place: "Рядом с нижней ступенькой лестницы на чердак",
    text: "Преступник оставил три маршрута: А — вниз, Б — вверх, В — наружу, к деревьям.\n«Я не покидал дома. Я не спускался вниз. Моя следующая тайна находится на пути к самому высокому помещению».",
    type: "route",
  },
  {
    title: "Королевская тайна",
    icon: "👑",
    code: "8073",
    place: "Под кроватью Дианы",
    text: "В этом доме сегодня живёт особа королевских кровей. У неё нет настоящей короны. Каждую ночь она отправляется в путешествие, не покидая комнаты. Ищите там, где заканчивается свет и начинается территория забытых вещей.",
    type: "royal",
  },
  {
    title: "Музыкальный код",
    icon: "🎹",
    code: "5629",
    place: "У фортепиано, рядом с нотами",
    text: "ФА — ДО — СОЛЬ — МИ — ЛЯ\nКаждая нота имеет свой номер. Превратите ноты в числа и сохраните код для финала.\nСледующая улика там, где белые и чёрные клавиши живут бок о бок.",
    type: "music",
  },
  {
    title: "Живой свидетель",
    icon: "🌱",
    code: "1496",
    place: "На обратной стороне горшка с комнатным растением",
    text: "Я живой, но у меня нет сердца.\nЯ расту, но не взрослею как человек.\nЯ пью, но не держу стакан.\nМне нужен свет, но я не умею включать лампу.\nЯ могу погибнуть от чрезмерной заботы.\nУлика рядом со мной, но не в земле.",
    type: "plant",
  },
  {
    title: "Последнее послание",
    icon: "🪞",
    code: "7305",
    place: "В финальном конверте под стулом в столовой",
    text: "ЙОВОЛОТС В МОЛУТС ДОП ИЩИ\nПрочитайте сообщение справа налево. Не всё тайное спрятано далеко. Иногда оно находится прямо под вами.",
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
