#!/bin/sh
echo '<html><table border="2">'
for str in `find ./ -name "*.diff"`; do echo '<tr><td>' $str '</td>'; echo '<td>'; cat $str| sed -n '/^#/p'| sed 's/#/<br>/g'; echo '</td></tr>'; done
echo '</table></html>'

