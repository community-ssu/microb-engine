#!/bin/sh

pushd ./; cd build-tree/mozilla; for str in `quilt applied`;do quilt refresh -u -U 8 --no-timestamps  -f --backup $str ; done; popd
