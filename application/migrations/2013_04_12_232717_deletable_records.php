<?php

class Deletable_Records {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		//
        Schema::table('records', function($table) {
            $table->boolean('deleted');
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
		//
        Schema::table('records', function($table) {
            $table->drop_column('deleted');
        });
	}

}
