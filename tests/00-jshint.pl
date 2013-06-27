#!/usr/bin/perl

use strict;
use warnings;
use Test::More;
use File::Spec;
use File::Find;
use File::Basename;

my $root = File::Spec->rel2abs( dirname(__FILE__) . '/..' );
$root =~ s#tests/\.\.##;

jshint( 'Client-side JS', $root . 'public/js' );
jshint( 'Test scripts', $root . 'tests' );

done_testing();

sub jshint {
    my ( $label, $dir ) = @_;
    subtest $label => sub {
        find(
            {
                bydepth  => 1,
                no_chdir => 1,
                wanted   => sub {
                    return unless m/[.]js$/;
                    ok(!system("jshint $_ 1>&2"), $_);
                },
            },
            $dir
        );
      }

}

