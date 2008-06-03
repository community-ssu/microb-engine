#!/bin/sh

HGURL="http://hg.mozilla.org/index.cgi/mozilla-central/archive/tip.tar.gz"
MOZCURSIMPDATE=$(date +"%Y%m%d")
MOZCURSTAMPDATE=$(date +"%s")
MOZCURDATE=$(date +"mozilla-hg-%Y%m%d")
CURDIR=$(pwd)
#OLDVER=$1
OLDVER=$(cat curver)

wget -c $HGURL -O temp.tar.gz
rm -f mozilla.tar.gz
mv temp.tar.gz mozilla.tar.gz
echo $MOZCURSIMPDATE > curver
echo $MOZCURSIMPDATE > deborigver
