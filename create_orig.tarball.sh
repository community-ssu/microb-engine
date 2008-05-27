#!/bin/sh

NAME=microb-engine_
VER=$(cat tarballs/deborigver)
#VER=$(cat tarballs/curver)

rm -rf $NAME*
rm -rf tarballs/mozilla
mkdir -p $NAME$VER
cp -rf tarballs $NAME$VER/
pushd . && cd $NAME$VER && find -name ".svn" -exec rm -rf {} + && rm -f *.sh && popd
tar -zcf $NAME$VER.orig.tar.gz $NAME$VER
rm -rf $NAME$VER

