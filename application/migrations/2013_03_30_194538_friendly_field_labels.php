<?php

class Friendly_Field_Labels {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		//
        Schema::table('fields', function($table) {
            $table->string('label');
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::table('fields', function($table) {
            $table->drop_column('label');
        });
	}

}
