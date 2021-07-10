<%inherit file="include/base.mako" />

<%block name="head">
<title>Главная страница | ${config['title']}</title>
</%block>

<%block name="content">
<div id="react-main-root">
  <noscript>
    <div class="alert alert-danger" role="alert">
      <b>Ошибка:</b> Для работы сайта требуется JavaScript!
    </div>
  </noscript>
</div>

<script src="/dist/bundle.js"></script>
</%block>
