#!/usr/bin/perl

use strict;
use warnings;
use Test::More;
use File::Spec;
use File::Find;
use File::Basename;

my $jshint = 'node_modules/jshint/bin/jshint';
my $root = File::Spec->rel2abs( dirname(__FILE__) . '/..' );
$root =~ s#tests/\.\.##;

ok(!system("${jshint} --config ${root}jshint.conf ${root}server.js 1>&2"), 'server.js app');

jshint( 'Server-side bin', $root . 'bin' );
jshint( 'Server-side JS', $root . 'lib' );
jshint( 'Routes', $root . 'routes' );
jshint( 'Models', $root . 'models' );
jshint( 'Client-side JS', $root . 'public/js', 'jshint-client.conf' );
jshint( 'Browserified JS', $root . 'clientjs', 'jshint-client.conf' );
jshint( 'Test scripts', $root . 'tests' );

done_testing();

sub jshint {
    my ( $label, $dir, $config ) = @_;
    $config ||= 'jshint.conf';
    subtest $label => sub {
        find(
            {
                bydepth  => 1,
                no_chdir => 1,
                wanted   => sub {
                    return unless m/[.]js$/;
                    return if m/generated/;
                    ok(!system("${jshint} --config ${root}${config} $_ 1>&2"), $_);
                },
            },
            $dir
        );
        done_testing();
      }

}

