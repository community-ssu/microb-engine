#!/bin/sh

MOZCURSIMPDATE=$(date +"%Y%m%d")
MOZCURSTAMPDATE=$(date +"%s")
MOZCURDATE=$(date +"mozilla-cvs-%Y%m%d")
CURDIR=$(pwd)
#OLDVER=$1
OLDVER=$(cat curver)

cvs -d tinderbox@tinderbox:/cvsroot login
cvs -d tinderbox@tinderbox:/cvsroot co mozilla/client.mk
cd mozilla
make -f client.mk checkout MOZ_CO_PROJECT="xulrunner,browser,suite" MOZ_CO_MODULE="mozilla/tools/jprof"
cd ..
date +%s > ./mozilla/timestamp
rm -f ./mozilla/extensions/canvas3d/src/visualinfo.c
tar -zcf mozilla.tar.gz mozilla/
echo $MOZCURSIMPDATE > curver

