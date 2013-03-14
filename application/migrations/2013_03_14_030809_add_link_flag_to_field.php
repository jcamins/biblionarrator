<?php

class Add_Link_Flag_To_Field {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('fields', function($table) {
            $table->boolean('link');
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
            $table->drop_column('link');
        });
	}

}
