#!/bin/sh
rss_file_path=$1
exec dbus-send --print-reply --type=method_call --dest=com.nokia.osso_rss_feed_reader /usr/bin/osso_rss_feed_reader com.nokia.osso_rss_feed_reader.mime_open string:$1

