#!/usr/bin/perl -w

my $file = `cat $ARGV[0];`;
my $from = "";
my $to = "";

while($file=~/^(.*)$/gm){
  my $line = $1;
  if ($line =~/renam\S from(.*)$/) {
    $from = $1;
  }
  if ($line =~/renam\S to(.*)$/) {
    $to = $1;
    next if (!$from || !$to);
    print "rename $from $to\n";
    system("mv $from $to");
    undef $from;
    undef $to;
  }
}