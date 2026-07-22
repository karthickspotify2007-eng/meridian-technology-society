#!/usr/bin/env python3
"""
Local dev server for the Meridian site.

Identical to `python -m http.server`, except every response is sent with
`Cache-Control: no-store` — plain `http.server` sends no caching headers at
all, which lets browsers cache HTML/CSS/JS heuristically and aggressively.
During active development that means edits can appear to "not apply" even
after a normal reload, because the browser is silently serving an old copy
of the file it fetched a minute ago. This costs nothing locally and removes
that whole class of confusion.

Usage: python serve.py [port]   (defaults to 8090)
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    http.server.test(HandlerClass=NoCacheHandler, port=port)
