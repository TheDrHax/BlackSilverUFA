import attr
from cached_property import cached_property

from .streams import streams, SegmentReference
from .blacklist import Blacklist, blacklist
from ..utils import load_json, join, json_escape, indent


GAMES_JSON = 'data/games.json'


@attr.s(auto_attribs=True)
class Game:
    name: str = attr.ib()
    category: str = attr.ib()
    id: str = attr.ib()
    type: str = None
    cover: int = 0
    streams: list = attr.ib(factory=list)
    _blacklist: Blacklist = attr.ib({}, converter=lambda x: Blacklist(**x))

    def __attrs_post_init__(self):
        refs = []

        for segment in self.streams:
            parent = streams[segment['twitch']][segment.get('segment') or 0]

            del segment['twitch']
            if 'segment' in segment:
                del segment['segment']

            ref = SegmentReference(parent=parent, game=self, **segment)
            ref.stream.games.append((self, ref))
            refs.append(ref)

        self.streams = refs

    @cached_property
    def blacklist(self):
        return blacklist + self._blacklist

    @property
    def date(self):
        return self.streams[self.cover].stream.date

    @join()
    def to_json(self, compiled: bool = False) -> str:
        if compiled:
            keys = ['name', 'category', 'type', 'id', 'streams', 'cover']
        else:
            keys = ['name', 'category', 'type', 'id',
                    'streams', 'cover', '_blacklist']

        yield '{\n  '

        first = True
        for key in keys:
            if key == 'cover' and self.cover == 0:
                continue

            if key == 'streams':
                yield ',\n  "streams": [\n'
                refs = [ref.to_json(compiled) for ref in self.streams]
                yield indent(',\n'.join(refs), 4)
                yield '\n  ]'
                continue

            if key == '_blacklist':
                if len(self._blacklist) == 0:
                    continue

                yield ',\n  "blacklist": '
                yield indent(self._blacklist.to_json(), 2)[2:]
                continue

            value = getattr(self, key)

            if not value:
                continue

            if not first:
                yield ',\n  '
            else:
                first = False

            yield f'"{key}": {json_escape(value)}'

        yield '\n}'

    def __str__(self):
        return self.to_json()


class Games(list):
    def __init__(self, filename: str = GAMES_JSON):
        self.filename = filename
        data = load_json(filename)

        ids = set()
        for game_raw in data:
            game = Game(**game_raw)

            if game.id in ids:
                raise ValueError(f'ID already taken: {game.id}')
            else:
                ids.add(game.id)

            self.append(game)

    @join()
    def to_json(self, compiled: bool = False) -> str:
        yield '[\n'

        first = True
        for game in self:
            if not first:
                yield ',\n'
            else:
                first = False

            yield indent(game.to_json(compiled), 2)

        yield '\n]'

    def __str__(self):
        return self.to_json()

    def save(self, filename: str = None, compiled: bool = False):
        if filename is None:
            filename = self.filename

        data = self.to_json(compiled)

        with open(filename, 'w') as fo:
            fo.write(data)
            fo.write('\n')


games = Games()
