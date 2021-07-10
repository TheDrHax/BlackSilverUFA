<%inherit file="include/base.mako" />

<%block name="head">
<title>Перенаправление | ${config['title']}</title>
<script type="text/javascript">
  const l = window.location;
  l.replace('/#' + l.pathname + l.search + l.hash);
</script>
</%block>
