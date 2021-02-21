<%inherit file="include/base.mako" />
<%namespace file="include/statistics.mako" name="stats" />

<%block name="head">
<title>Главная страница | ${config['title']}</title>
</%block>

<%block name="content">
## <p>Этот сайт содержит архив стримов и чата Twitch-канала <a href="https://www.twitch.tv/blackufa/">BlackUFA</a>. Источником записей служат официальные каналы <a href="https://www.youtube.com/user/BlackSilverUFA">BlackSilverUFA</a> и <a href="https://www.youtube.com/user/BlackSilverChannel">BlackSilverChannel</a>. В редких случаях запись не попадает ни на один из этих каналов, поэтому в архив вносятся неофициальные записи с <a href="/missing.html#youtube">YouTube</a>.</p>

## <p>Чат сохраняется в формате субтитров ASS сразу после завершения трансляции при помощи скрипта <a href="https://github.com/TheDrHax/Twitch-Chat-Downloader">Twitch-Chat-Downloader</a>. Все субтитры попадают в <a href="https://github.com/BlackSilverUfa/">репозитории на GitHub</a>, откуда их можно скачать и подключить к практически любому плееру.</p>

## <p>Для просмотра стримов не нужно что-то скачивать или устанавливать: в сайт встроен HTML5-плеер <a href="https://github.com/sampotts/plyr">Plyr</a> и движок субтитров <a href="https://github.com/Dador/JavascriptSubtitlesOctopus">Subtitles Octopus</a>. Просто выберите серию стримов ниже и наслаждайтесь <img src="https://static-cdn.jtvnw.net/emoticons/v1/180344/1.0" />-излучением :)</p>

## <%stats:statistics />

<div id="react-main-root">
  <noscript>
    <div class="alert alert-danger" role="alert">
      <b>Ошибка:</b> Для полноценной работы сайта требуется JavaScript!
    </div>
  </noscript>
</div>
</%block>