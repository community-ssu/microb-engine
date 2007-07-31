#!/usr/bin/perl -w 

my $new_ser = "";
mkdir("new");
open(FILE, "series");
my $i = 5;
while(my $line=<FILE>) {
  chomp($line);
#  printf("Preparing line: ".$line."\n");
  if ($line=~/^(\d+)\_(.*)\.diff(.*)$/) {
	my $num = $1;
	my $patch = $2.".diff";
    my $opts = $3;
    $opts = "" if (!$opts);
	$k = "$i";
	$k = "0".$k if ($k=~/^\d{2}$/);
	$k = "00".$k if ($k=~/^\d{1}$/);
	print $k."_$patch\n";
#    printf("cp $num"."_"."$patch new/$k"."_".$patch."\n");
	system("cp $num"."_"."$patch new/$k"."_".$patch);
    $opts=~s/\s+/\ /g;
    $opts=~s/\s+$//g;
	$new_ser .= $k."_$patch".$opts."\n";
    $i += 5;
  } else {
      if ($line=~/^(.*)\/(.*)\.diff(.*)$/) {
        if ($1!~/^\#/) {
        mkdir("new/".$1);
        system("cp $line new/".$1);
#        print ("$1;$2;$3;$4\n");
        }
      }
      $new_ser .= $line."\n";
  }
}
close(FILE);
open(FILE,">./new/series");
print FILE $new_ser;
close(FILE);
