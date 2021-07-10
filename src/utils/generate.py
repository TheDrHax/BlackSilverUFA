"""Usage: build [--no-webpack]"""


import os
import sys
import json
import shutil
from time import time
from subprocess import call

from docopt import docopt
from mako.lookup import TemplateLookup
from sortedcontainers import SortedDict

from . import _


DEBUG = False
config = streams = games = categories = None


def timed(label):
    def decorator(func):
        def wrapper(*args, **kwargs):
            t = time()
            res = func(*args, **kwargs)
            t = time() - t
            print(label.format(int(t * 1000)), file=sys.stderr)
            return res
        return wrapper
    return decorator


@timed('Database loaded in {}ms')
def load_database():
    global config, streams, games, categories, DEBUG
    from ..data import config, streams, games, categories
    from ..data.config import DEBUG


@timed('Fallbacks activated in {}ms')
def enable_fallbacks():
    streams.enable_fallbacks()


@timed('JSON files built in {}ms')
def build_data():
    from ..scripts.converter import generate_subtitles

    # Create required directories
    if not os.path.isdir(_('data')):
        os.mkdir(_('data'))

    tc_dict = SortedDict()

    for segment in streams.segments:
        # Generate preprocessed timecodes.json
        if len(segment.timecodes) > 0:
            tc_dict[segment.hash] = segment.timecodes.to_dict()

        # Generate subtitles
        generate_subtitles(segment)

    with open(_('data/timecodes.json'), 'w') as fo:
        json.dump(tc_dict, fo, ensure_ascii=False, indent=2)

    # Generate preprocessed segments.json
    streams.segments.save(_('data/segments.json'), compiled=True)

    # Generate preprocessed categories.json
    categories.save(_('data/categories.json'), compiled=True)

    # Generate preprocessed games.json
    games.save(_('data/games.json'), compiled=True)


@timed('Mako templates built in {}ms')
def build_mako():
    env = {
        '_': _,
        'config': config,
        'streams': streams,
        'games': games,
        'categories': categories
    }

    lookup = TemplateLookup(directories=['./src/mako'],
                            input_encoding='utf-8')

    # Recreate required directories
    if not os.path.isdir(_('')):
        os.mkdir(_(''))

    # Legacy cleanup
    for dp in ['links', 'r']:
        if os.path.isdir(_(dp)):
            shutil.rmtree(_(dp))

    for fp in ['search.html', 'missing.html']:
        if os.path.exists(_(fp)):
            os.unlink(_(fp))

    # Generate index.html, 404.html
    for i in ['index', '404']:
        with open(_(i + '.html'), 'w') as out:
            t = lookup.get_template(f'/{i}.mako')
            out.write(t.render(**env))


@timed('Webpack completed in {}ms')
def build_webpack():
    # Recreate required directories
    if os.path.isdir(_('dist')):
        shutil.rmtree(_('dist'))
    os.mkdir(_('dist'))

    # Webpack
    call(['webpack', '--config', 'src/js/webpack.config.js'])


@timed('Build completed in {}ms')
def generate(argv=None):
    args = docopt(__doc__, argv=argv)

    load_database()
    enable_fallbacks()

    # Create debug marker
    if DEBUG:
        open(_('.DEBUG'), 'a').close()
    elif os.path.exists(_('.DEBUG')):
        os.unlink(_('.DEBUG'))

    # Copy static files
    if os.path.isdir(_('static')):
        shutil.rmtree(_('static'))
    shutil.copytree('static', _('static'))

    # Create CNAME
    if config['domain']:
        with open(_('CNAME'), 'w') as fo:
            fo.write(config['domain'])
    elif os.path.exists(_('CNAME')):
        os.unlink(_('CNAME'))

    build_data()
    if not args['--no-webpack']:
        build_webpack()
    build_mako()


if __name__ == '__main__':
    generate()
