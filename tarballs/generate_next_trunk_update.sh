#!/bin/sh

MOZCURSIMPDATE=$(date +"%Y%m%d")
rm -rf mozilla mozilla.orig
tar -zxvf mozilla.tar.gz
mv mozilla mozilla.orig
cvs -d tinderbox@tinderbox:/cvsroot login
cvs -d tinderbox@tinderbox:/cvsroot co mozilla/client.mk
cd mozilla
#MOZDATE="MOZ_CO_DATE='2007-01-05 13:55:33'"
MOZDATE=""
make -f client.mk checkout MOZ_CO_PROJECT="xulrunner,browser,suite" $MOZDATE MOZ_CO_MODULE="mozilla/tools/jprof"
CURDATE=$(date +"%Y%m%d%H%M")

cd ../mozilla.orig
for str in `cat ../trunkupdates/series`;do patch -p1 < ../trunkupdates/$str; done
cd ..

rm -f mozilla.orig/configure mozilla/configure mozilla.orig/timestamp mozilla/timestamp
rm -f mozilla/extensions/canvas3d/src/visualinfo.c 
rm -f mozilla.orig/extensions/canvas3d/src/visualinfo.c 
diff -x CVS -ruN -p -U8 mozilla.orig mozilla > trunkupdates/$CURDATE"_trunkupdate.diff"
echo $CURDATE"_trunkupdate.diff" >> trunkupdates/series
echo $MOZCURSIMPDATE > curver
