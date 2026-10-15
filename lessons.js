(function (root) {
  'use strict';
  const chapters = [
    { title: 'Ein guter Anfang', subtitle: 'Grundstellung · Die Finger finden ihren Platz', icon: 'sprout', color: 'mint', lessons: [
      ['F und J', 'f j ff jj fj jf fff jjj fjf jfj ffjj jjff', 'Die Zeigefinger liegen auf F und J. Dort spürst du kleine Erhebungen.'],
      ['Die Grundreihe', 'a s d f j k l ö as df jk lö das all fall als', 'Lege die Finger auf A S D F und J K L Ö.'],
      ['Erste Wörter', 'das als all fall lass dass saal aal da ja kalk', 'Schau auf den Bildschirm. Genauigkeit kommt vor Geschwindigkeit.'],
      ['E und I', 'die idee alle seide das eis leise die feile', 'Die Finger kehren nach jedem Anschlag in die Grundstellung zurück.'],
      ['R und U', 'der die das du reis reise ufer ruder', 'Tippe ruhig und gleichmäßig. Die Leertaste drückst du mit dem Daumen.'],
      ['Erste Wortfolgen', 'die reise das eis der saal die feile der fall', 'Wörter üben wir hier noch klein. Großbuchstaben und Satzzeichen kommen später dazu.']
    ] },
    { title: 'Das ganze Alphabet', subtitle: 'Neue Tasten · Schritt für Schritt sicherer', icon: 'leaf', color: 'sky', lessons: [
      ['T und N', 'tante ente unten intern tinten lernen retten treten', 'Lass dir Zeit mit den neuen Tasten T und N.'],
      ['G und H', 'gehen heute gut tag haus hund hand hingehen', 'Beide Zeigefinger greifen auch zur Mitte der Tastatur.'],
      ['B und M', 'baum blume leben neben namen nehmen', 'Entspanne deine Hände. Du musst nicht fest auf die Tasten drücken.'],
      ['O und W', 'wo wohnen wolke wort wollen wohnung', 'Die deutschen Buchstaben findest du auf der QWERTZ-Tastatur.'],
      ['C, V und P', 'computer vier vogel papier pause camp', 'Neue Tasten: C, V und P. Kehre danach in die Grundstellung zurück.'],
      ['Q, X, Y und Z', 'quiz quer zimmer zehn zwei extra taxi yoga zylinder', 'Auf einer deutschen Tastatur steht Z oben und Y unten.']
    ] },
    { title: 'Typisch Deutsch', subtitle: 'Ä, Ö, Ü und ß · Kleine Zeichen, großer Unterschied', icon: 'flower', color: 'pink', lessons: [
      ['Ä wie Äpfel', 'ä älter mädchen käse bäcker bär äpfel gärten spät', 'Ein ä ist nicht dasselbe wie ae. Übe die echte Umlauttaste.'],
      ['Ö wie schön', 'ö schön hören können wörter öl löwe töne gröber', 'Ö liegt auf der deutschen Tastatur rechts neben L.'],
      ['Ü wie üben', 'ü üben tür über grün früh büro fünf müde küche', 'Ü findest du rechts neben P.'],
      ['Das scharfe S', 'ß straße grüße heißen weiß außen groß fuß süß', 'ß ist ein eigener Buchstabe. Die Taste liegt rechts neben der Null.'],
      ['Groß und klein', 'Äpfel Öl Übung Grüße Straße Größe Bäume Bücher Füße', 'Substantive beginnen im Deutschen mit einem Großbuchstaben.'],
      ['Alles zusammen', 'Fünf große Bäume stehen draußen. Die Vögel grüßen den Frühling.', 'Falls die Zeichen anders erscheinen: Prüfe das deutsche Tastaturlayout deines Systems.']
    ] },
    { title: 'Mitten im Alltag', subtitle: 'Nützliche Wörter · Für jeden Tag', icon: 'home', color: 'sand', lessons: [
      ['Guten Morgen', 'Guten Morgen! Wie geht es dir? Mir geht es gut, danke.', 'Satzzeichen gehören dazu. Halte den Rhythmus bis zum Satzende.'],
      ['Zu Hause', 'In der Küche steht ein Tisch. Das Fenster ist offen. Die Wohnung ist hell.', 'Nach einem Punkt folgt ein Leerzeichen.'],
      ['Beim Einkaufen', 'Ich hätte gern frisches Brot, zwei Äpfel und eine Flasche Wasser.', 'Das Komma liegt unten rechts neben M.'],
      ['Unterwegs', 'Der nächste Zug fährt nach Berlin. Wir warten am Bahnhof auf Gleis fünf.', 'Bleib entspannt, auch wenn ein Wort länger ist.'],
      ['Im Café', 'Möchtest du einen Kaffee oder einen Tee? Für mich bitte einen Tee ohne Zucker.', 'Das Fragezeichen liegt auf der deutschen Tastatur auf Umschalt + ß.'],
      ['Feierabend', 'Nach der Arbeit gehen wir spazieren. Später kochen wir zusammen und hören Musik.', 'Ein gleichmäßiger Rhythmus ist wichtiger als einzelne schnelle Wörter.']
    ] },
    { title: 'Sicher in jedem Satz', subtitle: 'Satzzeichen, Zahlen und längere Gedanken', icon: 'book', color: 'lavender', lessons: [
      ['Fragen stellen', 'Wie heißt du? Wo wohnst du? Was machst du heute? Wann treffen wir uns?', 'Du musst einen Tippfehler nicht löschen: Tippe einfach das richtige Zeichen.'],
      ['Zahlen im Alltag', 'Heute ist der 14. Oktober. Um 9:30 Uhr beginnt der Kurs in Raum 12.', 'Der Doppelpunkt liegt auf Umschalt + Punkt.'],
      ['Eine Nachricht', 'Hallo Anna, ich komme heute etwas später. Bitte warte vor dem Eingang. Bis gleich!', 'Mit Escape kannst du jederzeit pausieren.'],
      ['Am Arbeitsplatz', 'Bitte prüfe die Datei und schicke mir eine kurze Antwort. Vielen Dank für deine Hilfe.', 'Kurze Pausen zwischen den Lektionen entlasten die Hände.'],
      ['Genau hinschauen', 'E-Mail: hallo@beispiel.de. Preis: 12,50 Euro. Rabatt: 10%. Nummer: 42.', 'Für @ nutzt du auf einer deutschen Tastatur Alt Gr + Q.'],
      ['Ein guter Plan', 'Wenn das Wetter morgen schön ist, fahren wir mit dem Fahrrad an den See. Nimm bitte Wasser mit.', 'Tippe den Satz aufmerksam und ohne Hast.']
    ] },
    { title: 'Dein Schreibfluss', subtitle: 'Kleine Geschichten · Alles kommt zusammen', icon: 'mountain', color: 'mint', lessons: [
      ['Ein neuer Tag', 'Die Sonne scheint durch das Fenster. Lea öffnet die Tür und hört die Vögel im Garten. Sie freut sich auf einen ruhigen Tag.', 'Finde deinen eigenen Rhythmus und halte die Schultern locker.'],
      ['Auf dem Markt', 'Am Samstag besuchen wir den Markt. Dort gibt es frisches Gemüse, duftendes Brot und süße Früchte. Wir kaufen nur das, was wir brauchen.', 'Denk an die Umlaute und das scharfe S.'],
      ['In der Bibliothek', 'Zwischen den Regalen ist es angenehm still. Ich suche ein Buch über die Geschichte unserer Stadt. Die freundliche Mitarbeiterin hilft mir dabei.', 'Genauigkeit wird mit Sternen belohnt: Ab 98 Prozent gibt es drei.'],
      ['Ein kleiner Ausflug', 'Am frühen Morgen steigen wir in den Zug. Hinter dem Fenster ziehen grüne Wiesen und kleine Dörfer vorbei. Unser Ziel ist ein See in den Bergen.', 'Wenn du das Fenster verlässt, hält die Zeit automatisch an.'],
      ['Zusammen lernen', 'Eine neue Sprache lernt man nicht an einem einzigen Tag. Wir üben jeden Morgen ein wenig, stellen Fragen und freuen uns über jeden kleinen Fortschritt.', 'Tägliches, kurzes Üben ist ein guter Anfang.'],
      ['Gut gemacht!', 'Du hast dir Zeit genommen und viel geübt. Deine Finger finden die Tasten jetzt leichter. Bleib neugierig, mach regelmäßig Pausen und entdecke jeden Tag neue deutsche Wörter.', 'Geschafft! Wiederhole deine Lieblingslektionen und verbessere deine persönlichen Bestwerte.']
    ] }
  ];
  let number = 0;
  for (const chapter of chapters) {
    chapter.lessons = chapter.lessons.map(([title, text, hint]) => {
      number += 1;
      return { id: `lesson-${number}`, number, title, text, hint, chapter: chapter.title };
    });
  }
  const data = { chapters, lessons: chapters.flatMap(chapter => chapter.lessons) };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.TippLessons = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
