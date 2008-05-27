#!/usr/bin/perl -w

my $logfile = $ARGV[0];

my %hash = ();
my %hash2 = ();

open(FILE, "$logfile");
while(my $line=<FILE>)
{
    chomp($line);
    $hash{$line}++;
}
close(FILE);

foreach my $key (keys %hash)
{
    $hash2{$hash{$key}} = $key;
}

foreach my $key (sort {$a <=> $b} keys %hash2)
{
    print "$key ".$hash2{$key}."\n";
}



    