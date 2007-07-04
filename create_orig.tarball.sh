#!/bin/sh

NAME=microb-engine_
VER=$(cat tarballs/deborigver)

rm -rf $NAME*
mkdir -p $NAME$VER
cp -rf tarballs $NAME$VER/
pushd . && cd $NAME$VER && find -name ".svn" -exec rm -rf {} + && rm -f *.sh && popd
tar -zcvvf $NAME$VER.orig.tar.gz $NAME$VER
rm -rf $NAME$VER

