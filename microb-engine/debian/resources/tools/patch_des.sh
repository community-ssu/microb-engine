#!/bin/sh

# cd microb-engine/debian/patches 
# ../resources/tools/patch_des.sh series.thebestrunk  > patches.html

mkdir ./temp_patches
for str in `cat $1`; do mkdir -p ./temp_patches/$str; rmdir ./temp_patches/$str; cp $str ./temp_patches/$str 2>&1| > /dev/null; done
cd ./temp_patches

echo '<html><table border="2">'
for str in `find ./ -name "*.diff"`; do str2=$(echo $str | sed 's/\.\//https\:\/\/garage\.maemo\.org\/svn\/browser\/mozilla\/trunk\/microb\-engine\/microb\-engine\/debian\/patches\//g') && echo '<tr><td><a href="'$str2'">'$str'</a> </td>'; echo '<td>'; cat $str| sed -n '/^#/p'| sed 's/#/<br>/g'; echo '</td></tr>'; done
echo '</table></html>'
cd ..
rm -rf ./temp_patches

