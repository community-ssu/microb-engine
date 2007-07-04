#!/bin/sh

MOZCURSIMPDATE=$(date +"%Y%m%d")
MOZCURDATE=$(date +"mozilla-cvs-%Y%m%d")
CURDIR=$(pwd)
#OLDVER=$1
OLDVER=$(cat curver)

echo -n "Extracting curent mozilla sources..."
tar -zxvf mozilla-cvs.tar.gz > /dev/null
echo "...success."
cd mozilla-cvs-$OLDVER
echo "Upping external network..."
sudo /etc/network/upext.sh
echo -n "Creating patch from $OLDVER  at current version..."
rm -f ./configure
cvs -z3 update -D "$(date +"%Y-%m-%d %R")" configure
cvs -z3 diff -uN -D "$(date +"%Y-%m-%d %R")" > ../mozilla_diff_from_"$OLDVER"_to_$(date +"%Y%m%d").diff
echo "...success."
echo -n "Updating current sources to UP to TRUNK"
cvs -z3 update -D "$(date +"%Y-%m-%d %R")"
cd embedding/browser/gtk.old
cvs -z3 update -D "$(date +"%Y-%m-%d %R")"
echo "Upping back internal network..."
sudo /etc/network/upint.sh
cd $CURDIR
echo "Packing new sources..."
mv mozilla-cvs-$OLDVER $MOZCURDATE
tar -cvf mozilla-cvs.tar $MOZCURDATE > /dev/null
rm -f mozilla-cvs.tar.gz
gzip mozilla-cvs.tar
rm -rf $MOZCURDATE
echo "Updating version...."
echo "$MOZCURSIMPDATE" > curver
echo "Updating mozilla has been finished"
