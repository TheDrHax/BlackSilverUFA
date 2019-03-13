#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import shutil
from mako.lookup import TemplateLookup

from . import _
from ..data import config, streams, games, categories


lookup = TemplateLookup(directories=['./templates'],
                        module_directory='/tmp/mako_modules',
                        input_encoding='utf-8')


def generate():
    args = {
        '_': _,
        'config': config,
        'streams': streams,
        'games': games,
        'categories': categories
    }

    # Recreate required directores
    if not os.path.isdir(_('')):
        os.mkdir(_(''))
    for dp in ['links', 'src', 'r']:
        if os.path.isdir(_(dp)):
            shutil.rmtree(_(dp))
        os.mkdir(_(dp))

    # Create directory for generated data
    if not os.path.isdir(_('data')):
        os.mkdir(_('data'))

    # Copy static files
    if os.path.isdir(_('static')):
        shutil.rmtree(_('static'))
    shutil.copytree('static', _('static'))

    # Generate scripts
    with open(_("search.js"), "w") as output:
        t = lookup.get_template('/search.mako')
        output.write(t.render(**args).strip())
    with open(_("r/index.html"), "w") as output:
        t = lookup.get_template('/redirect.mako')
        output.write(t.render(**args).strip())
    shutil.copyfile(_("r/index.html"), _("src/player.html"))  # compatibility

    # Generate index.html, missing.html
    for i in ['index', 'missing']:
        with open(_(i + '.html'), "w") as out:
            t = lookup.get_template(f'/{i}.mako')
            out.write(t.render(**args))

    # Generate links/*.md
    t = lookup.get_template('/links.mako')
    for game in args['games']:
        filename = f'links/{game["filename"]}'
        with open(_(filename), "w") as out:
            out.write(t.render(game=game, **args).strip())


if __name__ == "__main__":
    generate()
