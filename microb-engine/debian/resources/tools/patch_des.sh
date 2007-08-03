#!/bin/sh

mkdir ./temp_patches
for str in `cat $1`; do cp $str ./temp_patches/ 2>&1| > /dev/null; done
cd ./temp_patches

echo '<html><table border="2">'
for str in `find ./ -name "*.diff"`; do echo '<tr><td>' $str '</td>'; echo '<td>'; cat $str| sed -n '/^#/p'| sed 's/#/<br>/g'; echo '</td></tr>'; done
echo '</table></html>'
cd ..
rm -rf ./temp_patches

