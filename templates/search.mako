<%! from templates.data.games import Game, SegmentReference %>

var Redirect = {
  index: {
    % for segment in streams.segments:
    "${segment.hash}": "${segment.references[0].game.filename}#${segment.hash}",
    % endfor
  },

  link: function (hash) {
    let dest = this.index[hash];

    if (dest !== undefined) {
      return dest;
    } else {
      return "/";
    }
  },

  go: function (hash) {
    let path = document.location.pathname + document.location.hash;
    let redirect = this.link(hash);

    if (path != redirect) {
      window.location.replace(this.link(hash));
    }
  }
}

var Search = {
  data: [
<% listed_games = [] %>\
  % for category in categories:
    % if category.search != False:
      % for game in reversed(category.games):
        % if type(game) == Game:
    {name: "${game.name}", path: "${game.filename}", year: ${game.date.year}, group: "${category.name}"},
        % elif type(game) == SegmentReference:
          % if game.game not in listed_games:
    {name: "${game.game.name}", path: "${game.game.filename}", year: ${game.date.year}, group: "${category.name}"},
<% listed_games.append(game.game) %>\
          % endif
          % for name in game.name.split(' / '):
    {name: "${name}", path: "${game.game.filename}#${game.hash}", year: ${game.date.year}, group: "${category.name}"},
          % endfor
        % endif
      % endfor
    % endif
  % endfor
  ],

  init: function() {
    autocomplete({
      minLength: 3,
      input: document.querySelector("#search"),
      fetch: function(text, update) {
        text = text.toLowerCase();
        var suggestions = Search.data.filter(n => n.name.toLowerCase().indexOf(text) !== -1);
        update(suggestions);
      },
      render: function(item, currentValue) {
        var div = document.createElement("div");
        div.innerHTML = item.name + ' - <span>' + item.year + '</span>';
        return div;
      },
      onSelect: function(item) {
        window.location = item.path;
      }
    });
  }
};
