#!/bin/sh

GRE_HOME=/usr/lib/microb-engine
export GRE_HOME=$GRE_HOME
cd $GRE_HOME
$GRE_HOME/run-mozilla.sh $GRE_HOME/Test*Embed $1
