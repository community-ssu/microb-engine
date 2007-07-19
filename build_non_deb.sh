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
TMP=$(pwd)/scratch_build
ROOT_CMD=fakeroot
BUILD_CMD=dpkg

GFX=gtk2
CONFIG=b3

#GFX=thebes
#CONFIG=thebes

rm -rf $TMP
cp -rf microb-engine $TMP
pushd .; cd $TMP; for str in `find ./ -name .svn`; do rm -rf $str; done; popd

for str in "*.png" "*.gif" "*.tar.gz"; do
  for str1 in `find $TMP/ -name "$str"`;do
    echo $str1
    if [ -s $str1 ]; then
      uuencode $str1 $str1 > $str1.uu && rm $str1
    fi
  done
done

tar -zxvf microb-engine_*.orig.tar.gz -C $TMP
for str in `find $TMP/ -name tarballs`; do
  mv $str $TMP
  rm -rf $TMP/$NAME*
done

btree=$TMP/build-tree
builddir=$btree/mozilla
mkdir -p $builddir

tar -zxvf $TMP/tarballs/mozilla.tar.gz -C $btree > /dev/null
cp -rf  $TMP/debian/resources/branding $builddir/
#cd $(builddir) && cd layout && mv svg svg.back && cp -rf ../../../debian/resources/sandbox/svg_backport/layout/svg ./
#cd $(builddir) && cd content && mv svg svg.back && cp -rf ../../../debian/resources/sandbox/svg_backport/content/svg ./

cd $builddir && cp -f ../../debian/configs/mozconfig$CONFIG ./mozconfig
cd $builddir && rm -f patches && ln -s ../../debian/patches && rm -f patches/series && ln -s series.$GFX patches/series
cd $builddir 

echo "Applying patches... > patch.stamp"
quilt push -a -v >  $builddir/patch.stamp

echo "mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/../obj-dir" >> ./mozconfig
#echo "mk_add_options MOZ_MAKE_FLAGS=-j9" >> ./mozconfig
echo "MOZ_APP_VERSION=1.0.1" >> ./mozconfig
echo "MOZILLA_VERSION=1.0.1" >> ./mozconfig

#echo "ac_add_options --build=i486-linux-gnu" >> ./mozconfig
#echo "ac_add_options --build=arm-..." >> ./mozconfig

echo "ac_add_options --prefix=/usr" >> ./mozconfig
echo "ac_add_options --enable-canvas" >> ./mozconfig
echo "ac_add_options --enable-microbembed --enable-microbembeddyn" >> ./mozconfig
echo "ac_add_options --enable-optimize=\" -g -O2\"" >> ./mozconfig

echo "ac_add_options --disable-static" >> ./mozconfig
echo "ac_add_options --enable-shared" >> ./mozconfig
echo "ac_add_options --disable-js-static-build" >> ./mozconfig

autoconf

echo "Preparing engine for building finished"
echo "Run:"
echo "    make -f client.mk build_all"
echo "    ...."
echo "    http://developer.mozilla.org/en/docs/Build_Documentation"
echo; echo;

