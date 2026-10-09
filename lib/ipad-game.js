// This function is sent as a classic script. Keep its body ES5-compatible:
// no modules, promises, arrow functions, optional chaining, or framework runtime.
export function startIpadGame(data, restoreState, matchesCode) {
  var missions = data.missions;
  var state = data.initial;
  var timer = null;
  var app = document.getElementById('ipad-game');
  var warning = document.getElementById('save-warning');
  try { state = restoreState(JSON.parse(localStorage.getItem(data.key))); } catch (error) {}
  function escape(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }
  function button(label, action) {
    return '<button class="primary" type="button" data-action="' + action + '">' + label + '</button>';
  }
  function save() {
    try { localStorage.setItem(data.key, JSON.stringify(state)); warning.hidden = true; }
    catch (error) { warning.hidden = false; }
  }
  function go(stage, phase, stars) {
    state = { stage: stage, phase: phase, stars: stars };
    save(); render();
  }
  function done() { go(state.stage, state.stage === 7 ? 'won' : 'clue', state.stage + 1); }
  function stars() { return '<p class="stars">' + new Array(state.stars + 1).join('⭐') + '</p><p>' + state.stars + ' von 8 Sternen gesammelt</p>'; }
  function checks(labels) {
    return labels.map(function (label) { return '<label class="check"><input type="checkbox"> ' + escape(label) + '</label>'; }).join('') +
      '<button class="primary" data-action="done" id="complete" disabled>Stern einsammeln ⭐</button>';
  }
  function form(code) {
    return '<form id="answer-form"><input id="answer" class="input" aria-label="' + (code ? 'Geheimcode' : 'Rätselantwort') + '" placeholder="' + (code ? 'GEHEIMCODE' : 'EURE ANTWORT') + '" maxlength="80" autocomplete="off" autocapitalize="characters"><p id="error" role="alert"></p><button class="primary" type="submit">' + (code ? 'Code prüfen 🔓' : 'Antwort prüfen') + '</button></form>';
  }
  function render() {
    clearInterval(timer);
    var m = missions[state.stage];
    var html;
    if (state.phase === 'start') {
      html = '<div class="emoji">🗝️🌟</div><h1>Die geheime Geburtstagsschatzsuche</h1><p>Sieben geheimnisvolle Orte. Acht magische Sterne. Ein versteckter Schatz!</p><p class="note">Spielt gemeinsam auf einem Tablet. Findet an jedem Ort eine Codekarte, gebt den Code ein und löst die Aufgabe.</p>' + button('Abenteuer starten ✨', 'start');
    } else if (state.phase === 'won') {
      html = '<h1>Ihr habt es geschafft! 🎉</h1>' + stars() + '<div class="emoji">🎁🏆🎁</div><p>Alle Missionen bestanden! Ihr seid echte Schatzsucherinnen!</p><p class="note">Der Schatz gehört euch! Sucht jetzt eure Geburtstagstüten!</p>';
    } else if (state.phase === 'code') {
      html = '<p>Geheime Fundstelle ' + state.stage + ' von 7</p><h1>Geheimcode gefunden? 🔐</h1>' + stars() + '<p>Sucht die Codekarte am richtigen Ort und gebt den Code ein.</p>' + button('↩ Hinweis noch einmal lesen', 'reread') + form(true);
    } else if (state.phase === 'clue') {
      html = '<h1>Stern verdient! 🌟</h1>' + stars() + '<p class="note">' + escape(m.clue) + '</p>' + button('Code suchen 🔎', 'search');
    } else {
      html = '<div class="emoji">' + m.emoji + '</div><h1>' + escape(m.title) + '</h1>' + stars() + '<p>' + escape(m.intro) + '</p><p class="note">' + escape(m.task) + '</p>';
      if (m.type === 'code') html += button('Auf zum Gefrierschrank! ❄️', 'first');
      else if (m.type === 'memory' || m.type === 'final') html += '<div id="timed">' + button(m.type === 'memory' ? '15-Sekunden-Test starten ⏱️' : '10-Sekunden-Pose starten 📸', 'timer') + '</div>';
      else if (m.type === 'riddle') html += form(false);
      else html += checks(m.type === 'check' ? ['Etwas Grünes 🌿', 'Etwas, das sich bewegt 🦋', 'Etwas, das weiter als 10 Meter entfernt ist 🔭'] : ['Wir haben die Aufgabe gemeinsam geschafft!']);
    }
    app.innerHTML = html;
    app.focus();
    var answerForm = document.getElementById('answer-form');
    if (answerForm) answerForm.onsubmit = function (event) {
      event.preventDefault();
      var input = document.getElementById('answer');
      if (state.phase === 'code' && matchesCode(input.value, missions[state.stage - 1].code)) go(state.stage, 'challenge', state.stage);
      else if (state.phase === 'challenge' && input.value.toLowerCase().replace(/[^a-zäöüß]/g, '').indexOf('meerschweinchen') !== -1) done();
      else {
        document.getElementById('error').textContent = state.phase === 'code' ? 'Das war noch nicht der richtige Code. Sucht weiter! 🔍' : 'Denkt an Heu, Gemüse und ein kleines flauschiges Tier. 🐾';
        input.focus(); input.select();
      }
    };
  }
  function startTimer() {
    clearInterval(timer);
    var memory = missions[state.stage].type === 'memory';
    var deadline = Date.now() + (memory ? 15 : 10) * 1000;
    var box = document.getElementById('timed');
    box.innerHTML = '<div class="timer" id="count" role="timer"></div>' + (memory ? '<div class="words">' + data.words.map(function (word) { return '<span>' + escape(word) + '</span>'; }).join('') + '</div>' : '<p>Alle vor den Spiegel! Macht eure verrückteste Pose! 🤪</p>');
    function tick() {
      var remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (remaining > 0) document.getElementById('count').textContent = remaining;
      else {
        clearInterval(timer);
        box.innerHTML = memory ? '<h2>Wörter versteckt! 🙈</h2><p>Nennt gemeinsam mindestens fünf Wörter aus dem Gedächtnis.</p>' + checks(['Wir haben mindestens fünf richtig genannt!']) + button('Noch einmal versuchen', 'timer') : '<h2>Was für eine Pose! 📸</h2>' + button('Letzten Stern einsammeln! 🏆', 'done');
      }
    }
    timer = setInterval(tick, 200); tick();
  }
  app.onclick = function (event) {
    var action = event.target.getAttribute('data-action');
    if (action === 'start') go(0, 'challenge', 0);
    else if (action === 'first') go(1, 'code', 0);
    else if (action === 'reread' && state.phase === 'code') go(state.stage - 1, state.stage === 1 ? 'challenge' : 'clue', state.stars);
    else if (action === 'search') go(state.stage + 1, 'code', state.stars);
    else if (action === 'done') done();
    else if (action === 'timer') startTimer();
  };
  app.onchange = function () {
    var inputs = app.querySelectorAll('input[type="checkbox"]');
    var complete = document.getElementById('complete');
    var all = true;
    for (var i = 0; i < inputs.length; i++) if (!inputs[i].checked) all = false;
    if (complete) complete.disabled = !all;
  };
  document.getElementById('reset').onclick = function () {
    if (window.confirm('Möchtet ihr wirklich alle Sterne löschen und neu anfangen?')) go(-1, 'start', 0);
  };
  render(); save();
}
