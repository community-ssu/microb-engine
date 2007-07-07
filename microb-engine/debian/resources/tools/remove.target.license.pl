#!/usr/bin/perl -w

my $target_dir = $ARGV[0];

my $files = `find $target_dir -type f`;

while($files=~/^(.*)$/gm)
{
    my $file = $1;
    my $ofile = "";
    open(FILE, "$file");
    my $lic = 0;
    while(my $line=<FILE>)
    {
	$lic = 1 if ($line=~/BEGIN\ LICENSE\ BLOCK/);
	$ofile .= $line if ($lic == 0);
	$lic = 0 if ($line=~/END\ LICENSE\ BLOCK/);
    }
    close(FILE);
    $ofile=~s%\/\*.*\*\/%%g;
    open(FWRITE, ">$file");
    print FWRITE $ofile; 
    close(FWRITE);
}


