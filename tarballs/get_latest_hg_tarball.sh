#!/bin/sh

HGURL="http://172.21.43.45/hg/mozilla-1.9.2/archive/0000f3d73219.tar.gz"
MOZCURSIMPDATE=$(date +"%Y%m%d")
MOZCURSTAMPDATE=$(date +"%s")
MOZCURDATE=$(date +"mozilla-hg-%Y%m%d")
CURDIR=$(pwd)
#OLDVER=$1
OLDVER=$(cat curver)

svn update

default_hg="http://hg.mozilla.org/mozilla-central"

HG_REPO=$HG_REPOSITORY
HG_LREPO=$HG_LREPOSITORY
if [ "$HG_REPO" == "" ]; then
  HG_REPO=$default_hg
fi

if [ "$HG_LREPO" == "" ]; then
  hg clone $HG_REPO mozilla
  HG_LREPO=$(pwd)/mozilla
fi

hg pull -R $HG_LREPO
hg update -R $HG_LREPO
CUR_REV=$(cat bonsai.date)
LAST_REV=$(hg log --limit 1 -R $HG_LREPO | grep 'changeset' | sed 's/\:/\ /g' | awk '{print $3}')
if [ "$CUR_REV" != "$LAST_REV" ];then
echo "$LAST_REV" > bonsai.date
fi
echo $HG_REPO

wget -c $HGURL -O temp.tar.gz
rm -f mozilla.tar.gz
mv temp.tar.gz mozilla.tar.gz
echo $MOZCURSIMPDATE > curver
echo $MOZCURSIMPDATE > deborigver
#echo "" > ../microb-engine/trunkupdates/series
#svn rm ../microb-engine/trunkupdates/*.diff
