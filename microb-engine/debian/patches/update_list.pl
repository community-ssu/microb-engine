#!/usr/bin/perl -w

my $patches =`ls -1 *.diff`;
system("echo \"\" > series");
while($patches=~/^(.*)$/gm) {
    $patch = $1;
    if ($patch=~/\_l(p\d+)\.diff/) {
	system("echo \"$patch -$1\" >> series");
    } else {
	system("echo \"$patch\" >> series");
    }
}
