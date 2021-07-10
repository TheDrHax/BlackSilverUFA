import os
from ..utils import load_json


tcd_config = load_json('config/tcd.json')
config = load_json('config/config.json')
DEBUG = os.environ.get('DEBUG', '0') == '1'


if DEBUG:
    config['prefix'] = ''

    for path, mount in config['repos']['mounts'].items():
        if not path.startswith('$PREFIX/chats'):
            continue

        mount['prefix'] = path.replace('$PREFIX', '')
