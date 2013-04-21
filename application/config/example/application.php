<?php

return array(

	/*
	|--------------------------------------------------------------------------
	| Application URL
	|--------------------------------------------------------------------------
	|
	| The URL used to access your application without a trailing slash. The URL
	| does not have to be set. If it isn't, we'll try our best to guess the URL
	| of your application.
	|
	*/

	'url' => '',

	/*
	|--------------------------------------------------------------------------
	| Asset URL
	|--------------------------------------------------------------------------
	|
	| The base URL used for your application's asset files. This is useful if
	| you are serving your assets through a different server or a CDN. If it
	| is not set, we'll default to the application URL above.
	|
	*/

	'asset_url' => '',

	/*
	|--------------------------------------------------------------------------
	| Application Index
	|--------------------------------------------------------------------------
	|
	| If you are including the "index.php" in your URLs, you can ignore this.
	| However, if you are using mod_rewrite to get cleaner URLs, just set
	| this option to an empty string and we'll take care of the rest.
	|
	*/

	'index' => '',

	/*
	|--------------------------------------------------------------------------
	| Application Key
	|--------------------------------------------------------------------------
	|
	| This key is used by the encryption and cookie classes to generate secure
	| encrypted strings and hashes. It is extremely important that this key
	| remains secret and it should not be shared with anyone. Make it about 32
	| characters of random gibberish.
	|
	*/

    'key' => '',

	/*
	|--------------------------------------------------------------------------
	| Profiler Toolbar
	|--------------------------------------------------------------------------
	|
	| Laravel includes a beautiful profiler toolbar that gives you a heads
	| up display of the queries and logs performed by your application.
	| This is wonderful for development, but, of course, you should
	| disable the toolbar for production applications.
	|
	*/

	'profiler' => false,

	/*
	|--------------------------------------------------------------------------
	| Application Character Encoding
	|--------------------------------------------------------------------------
	|
	| The default character encoding used by your application. This encoding
	| will be used by the Str, Text, Form, and any other classes that need
	| to know what type of encoding to use for your awesome application.
	|
	*/

	'encoding' => 'UTF-8',

	/*
	|--------------------------------------------------------------------------
	| Default Application Language
	|--------------------------------------------------------------------------
	|
	| The default language of your application. This language will be used by
	| Lang library as the default language when doing string localization.
	|
	*/

	'language' => 'en',

	/*
	|--------------------------------------------------------------------------
	| Supported Languages
	|--------------------------------------------------------------------------
	|
	| These languages may also be supported by your application. If a request
	| enters your application with a URI beginning with one of these values
	| the default language will automatically be set to that language.
	|
	*/

	'languages' => array(),

	/*
	|--------------------------------------------------------------------------
	| SSL Link Generation
	|--------------------------------------------------------------------------
	|
	| Many sites use SSL to protect their users' data. However, you may not be
	| able to use SSL on your development machine, meaning all HTTPS will be
	| broken during development.
	|
	| For this reason, you may wish to disable the generation of HTTPS links
	| throughout your application. This option does just that. All attempts
	| to generate HTTPS links will generate regular HTTP links instead.
	|
	*/

	'ssl' => true,

	/*
	|--------------------------------------------------------------------------
	| Application Timezone
	|--------------------------------------------------------------------------
	|
	| The default timezone of your application. The timezone will be used when
	| Laravel needs a date, such as when writing to a log file or travelling
	| to a distant star at warp speed.
	|
	*/

	'timezone' => 'UTC',
);
