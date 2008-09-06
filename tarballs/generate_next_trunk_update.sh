#!/bin/sh

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
CUR_REV=$(tail -n 1 ../microb-engine/trunkupdates/series | sed 's/^.*://' | sed 's/.diff$//')
LAST_REV=$(hg log --limit 1 -R $HG_LREPO | grep '^changeset' | sed 's/\:/\ /g' | awk '{print $3}')
echo "hg diff -R $HG_LREPO -r $CUR_REV > $CUR_REV:$LAST_REV.diff"
if [ "$CUR_REV" != "$LAST_REV" ];then
hg diff -R $HG_LREPO -r $CUR_REV > ../microb-engine/trunkupdates/$CUR_REV:$LAST_REV.diff
echo "$CUR_REV:$LAST_REV.diff" >> ../microb-engine/trunkupdates/series
svn add ../microb-engine/trunkupdates/$CUR_REV:$LAST_REV.diff
fi
echo $HG_REPO
