#!/usr/bin/perl -w

my $patch = $ARGV[0];

if (!$patch) {
    print "Patchname not specified\n";
    $patch =`quilt next`;
    if ($patch=~/^\s*$/) {
	print "\nAll patches has been applied...\n fakeroot dpkg-buildpackage -us -uc -nc \nDon't forgot run debian/tools/refresh_patches.sh for updating patches!!!\n";
	exit(0);
    }
    chomp($patch);
    print "Trying to apply[fix] $patch\n";
}

my $quilt_out = `cd build-tree/mozilla && quilt push --color --interactive --leave-rejects -v $patch`;

if ($quilt_out=~/needs\ to\ be\ refreshed\ first\./) {
    print "Previous edited patch not refreshed\n\trun: sh debian/tools/refresh_patches.sh\n";
    exit(0);
}


if ($quilt_out=~/is\ not\ in\ series/) {
    print "No such patch in patches list!!!\n";
    exit(0);
}

if ($quilt_out=~/is\ currently\ applied/) {
    print "Patch already applied, try to search *.rej files\n and fix problems...\nDon't forgot run debian/tools/refresh_patches.sh for updating patches!!!\n";
    exit(0);
}



$quilt_out = `cd build-tree/mozilla && quilt push --color --interactive -f --leave-rejects -v $patch`;

while($quilt_out=~/^(.*)/gm) {
    my $line = $1;
    if ($line=~/saving rejects to file/ || $line=~/.rej/) {
	if ($line=~/saving\ rejects\ to\ file\ (\S+)\.rej/) {
	    my $filename = $1;
	    system("vim -O -n build-tree/mozilla/$1 build-tree/mozilla/$1.rej");
	}
    }    
}

`cd build-tree/mozilla && quilt refresh -u -U 8 --no-timestamps -f --backup --strip-trailing-whitespace "$patch"`;

