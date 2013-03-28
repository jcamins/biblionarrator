<?php

class Change_Charset {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		//
        DB::query('alter table records convert to character set utf8;');
        DB::query('alter table fields convert to character set utf8;');
        DB::query('alter table recordtypes convert to character set utf8;');
        DB::query('alter table styles convert to character set utf8;');
        DB::query('alter table recordtype_style convert to character set utf8;');
        DB::query('alter table collections convert to character set utf8;');
        DB::query('alter table record_links convert to character set utf8;');
        DB::query('alter table field_links convert to character set utf8;');
        DB::query('alter table primaries convert to character set utf8;');
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
		//
	}

}
