#!/bin/sh

if test -x /usr/bin/uuencode; then
  echo "uuencode installed, ok"
else
  echo "uuencode not installed,"
  echo "Please do:"
  echo "apt-get install sharutils"
  exit 0
fi

NAME=microb-engine_
VER=$(cat tarballs/deborigver)
TMP=./delete_me
ROOT_CMD=fakeroot
BUILD_CMD=dpkg

if [ "$1" == "svn" ]; then
  BUILD_CMD=svn
  TMP=microb-engine
  mkdir build-area
  cp -f ./microb-engine*.orig.tar.gz build-area
  pushd .; cd $TMP; $BUILD_CMD-buildpackage -uc -us -S -r$ROOT_CMD; popd
else
rm -rf $TMP
cp -rf microb-engine $TMP
pushd .; cd $TMP; for str in `find ./ -name .svn`; do rm -rf $str; done; popd

for str in "*.png" "*.gif" "*.tar.gz"; do
  for str1 in `find ./delete_me/ -name "$str"`;do
    echo $str1
    if [ -s $str1 ]; then
      uuencode $str1 $str1 > $str1.uu && rm $str1
    fi
  done
done

pushd .; cd $TMP; $BUILD_CMD-buildpackage -uc -us -S -r$ROOT_CMD; popd
rm -rf $TMP
fi

exit 0

