#!/bin/sh

pushd ./; cd build-tree/mozilla; quilt refresh -u -U 8 --no-timestamps -f --backup --strip-trailing-whitespace "$1"; popd
